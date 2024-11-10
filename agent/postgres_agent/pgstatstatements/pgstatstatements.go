// Package pgstatstatements runs built-in Agent for PostgreSQL pg stats statements.
package pgstatstatements

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/agents"
	"github.com/borealis/postgres_agent/cache"
	"github.com/borealis/postgres_agent/pg"
	"github.com/jmoiron/sqlx"
	pg_query "github.com/pganalyze/pg_query_go/v4"
	"gopkg.in/reform.v1"
	"io"
	"math"
	"strconv"
	"strings"
	"time"

	_ "github.com/lib/pq" // register SQL driver
	"github.com/pkg/errors"
	"github.com/sirupsen/logrus"
	"gopkg.in/reform.v1/dialects/postgresql"
)

const (
	retainStatStatements    = 25 * time.Hour // make it work for daily queries
	statStatementsCacheSize = 5000           // cache size rows limit
	queryStatStatements     = time.Minute
)

type statementsMap map[int64]*pgStatStatementsExtended

// PGStatStatements services connects to PostgreSQL and extracts stats.
type PGStatStatements struct {
	q               *reform.Querier
	dbCloser        io.Closer
	agentID         string
	l               *logrus.Entry
	changes         chan agents.StatementChange
	statementsCache *statementsCache
	params          *agents.Params
	pgUtils         *pg.PGUtils
}

const queryTag = "borealis-agent:pgstatstatements"

// New creates new PGStatStatements service.
func New(sqlDB *sql.DB, params *agents.Params, l *logrus.Entry, cache *cache.CacheV2) (*PGStatStatements, error) {
	q := reform.NewDB(sqlDB, postgresql.Dialect, reform.NewPrintfLogger(l.Debugf)).WithTag(queryTag)
	return newPgStatStatements(q, sqlDB, params.AgentID, l, params, cache)
}

func newPgStatStatements(q *reform.Querier, db *sql.DB, agentID string, l *logrus.Entry, params *agents.Params, v2 *cache.CacheV2) (*PGStatStatements, error) {
	statementCache, err := newStatementsCache(statementsMap{}, retainStatStatements, statStatementsCacheSize, l)
	if err != nil {
		return nil, errors.Wrap(err, "cannot create cache")
	}
	conn := sqlx.NewDb(db, "postgres")
	pgUtils := pg.NewPGUtils(v2, l)
	pgUtils.SetConn(conn)

	return &PGStatStatements{
		q:               q,
		dbCloser:        db,
		agentID:         agentID,
		l:               l,
		changes:         make(chan agents.StatementChange, 10),
		statementsCache: statementCache,
		params:          params,
		pgUtils:         pgUtils,
	}, nil
}

func (m *PGStatStatements) rowsByVersion(ctx context.Context, tail string) (*sql.Rows, error) {
	pgVersion, err := m.pgUtils.GetVersion(ctx)
	if err != nil {
		return nil, err
	}

	columns := strings.Join(m.q.QualifiedColumns(pgStatStatementsView), ", ")
	switch {
	case pgVersion >= 13:
		columns = strings.Replace(columns, `"total_time"`, `"total_exec_time"`, 1)
	}

	return m.q.Query(fmt.Sprintf("SELECT /* %s */ %s FROM %s %s", queryTag, columns, m.q.QualifiedView(pgStatStatementsView), tail))
}

// Run extracts stats data and sends it to the channel until ctx is canceled.
func (m *PGStatStatements) Run(ctx context.Context) {
	defer func() {
		m.dbCloser.Close()
		close(m.changes)
	}()

	// add current stat statements to cache, so they are not send as new on first iteration with incorrect timestamps
	var err error

	if current, _, err := m.getStatStatementsExtended(ctx); err == nil {
		if err = m.statementsCache.Set(current); err == nil {
			m.l.Infof("Got %d initial stat statements.", len(current))
		}
	}

	if err != nil {
		m.l.Error(err)
	}

	// query pg_stat_statements every minute at 00 seconds
	start := time.Now()
	wait := start.Truncate(queryStatStatements).Add(queryStatStatements).Sub(start)
	m.l.Infof("Scheduling next collection in %s at %s.", wait, start.Add(wait).Format("15:04:05"))
	t := time.NewTimer(wait)
	defer t.Stop()

	for {
		select {
		case <-ctx.Done():
			m.l.Infof("Context canceled.")
			return

		case <-t.C:
			lengthS := uint32(math.Round(wait.Seconds())) // round 59.9s/60.1s to 60s
			buckets, err := m.getNewBuckets(ctx, start, lengthS)

			start = time.Now()
			wait = start.Truncate(queryStatStatements).Add(queryStatStatements).Sub(start)
			m.l.Infof("Scheduling next collection in %s at %s.", wait, start.Add(wait).Format("15:04:05"))

			t.Reset(wait)

			if err != nil {
				m.l.Error(err)
				continue
			}

			m.changes <- agents.StatementChange{MetricsSample: buckets}
		}
	}
}

// getStatStatementsExtended returns the current state of pg_stat_statements table with extended information (database, username, tables)
// and the previous cashed state.
func (m *PGStatStatements) getStatStatementsExtended(ctx context.Context) (currentStatmentsMap, prevviousStatementsMap statementsMap, err error) {
	var totalN, newN, newSharedN, oldN int
	start := time.Now()
	defer func() {
		dur := time.Since(start)
		m.l.Debugf("Selected %d rows from pg_stat_statements in %s: %d new (%d shared tables), %d old.", totalN, dur, newN, newSharedN, oldN)
	}()

	currentStatmentsMap = make(statementsMap, m.statementsCache.cache.Len())
	prevviousStatementsMap = make(statementsMap, m.statementsCache.cache.Len())
	if err = m.statementsCache.Get(prevviousStatementsMap); err != nil {
		return
	}

	// load all databases and usernames first as we can't use querier while iterating over rows below
	databases := queryDatabases(m.q)
	usernames := queryUsernames(m.q)

	rows, e := m.rowsByVersion(ctx, "WHERE queryid IS NOT NULL AND query IS NOT NULL")
	if e != nil {
		err = e
		return
	}
	defer rows.Close()

	for ctx.Err() == nil {
		var row pgStatStatements
		if err = m.q.NextRow(&row, rows); err != nil {
			if errors.Is(err, reform.ErrNoRows) {
				err = nil
			}
			break
		}
		totalN++
		statementsExtended := &pgStatStatementsExtended{
			pgStatStatements: row,
			Database:         databases[row.DBID],
			Username:         usernames[row.UserID],
		}

		if prevStatement := prevviousStatementsMap[statementsExtended.QueryID]; prevStatement != nil {
			oldN++
			newSharedN++

			statementsExtended.Tables = prevStatement.Tables
			statementsExtended.Query, statementsExtended.IsQueryTruncated = prevStatement.Query, prevStatement.IsQueryTruncated
		} else {
			newN++

			statementsExtended.IsQueryTruncated = false
		}

		currentStatmentsMap[statementsExtended.QueryID] = statementsExtended
	}
	if ctx.Err() != nil {
		err = ctx.Err()
	}
	if err != nil {
		err = errors.Wrap(err, "failed to fetch pg_stat_statements")
	}

	return currentStatmentsMap, prevviousStatementsMap, err
}

func (m *PGStatStatements) getNewBuckets(ctx context.Context, periodStart time.Time, periodLengthSecs uint32) ([]*proto.MetricsBucket, error) {
	current, prev, err := m.getStatStatementsExtended(ctx)
	if err != nil {
		return nil, err
	}

	buckets := makeBuckets(ctx, current, prev, m.l, m.params, m.pgUtils)
	startS := uint32(periodStart.Unix())
	m.l.Debugf("Made %d buckets out of %d stat statements in %s+%d interval.",
		len(buckets), len(current), periodStart.Format("15:04:05"), periodLengthSecs)

	// merge prev and current in cache
	if err = m.statementsCache.Set(current); err != nil {
		return nil, err
	}
	m.l.Debugf("statStatementsCache: %s", m.statementsCache.cache.Stats())

	// add agent_id and timestamps
	for i, b := range buckets {
		b.AgentId = m.agentID
		b.PeriodStartUnixSecs = startS
		b.PeriodLengthSecs = periodLengthSecs

		buckets[i] = b
	}

	return buckets, nil
}

// makeBuckets uses current state of pg_stat_statements table and accumulated previous state
// to make metrics buckets.
func makeBuckets(ctx context.Context, current, prev statementsMap, log *logrus.Entry, params *agents.Params, pgUtils *pg.PGUtils) []*proto.MetricsBucket {
	res := make([]*proto.MetricsBucket, 0, len(current))

	for queryID, currentPSS := range current {
		prevPSS := prev[queryID]
		if prevPSS == nil {
			prevPSS = &pgStatStatementsExtended{}
		}
		count := float32(currentPSS.Calls - prevPSS.Calls)
		switch {
		case count == 0:
			// Another way how this is possible is if pg_stat_statements was truncated,
			// and then the same number of queries were made.
			// Currently, we can't differentiate between those situations.
			log.Tracef("Skipped due to the same number of queries: %s.", currentPSS)
			continue
		case count < 0:
			log.Debugf("Truncate detected. Treating as a new query: %s.", currentPSS)
			prevPSS = &pgStatStatementsExtended{}
			count = float32(currentPSS.Calls)
		case prevPSS.Calls == 0:
			log.Debugf("New query: %s.", currentPSS)
		default:
			log.Debugf("Normal query: %s.", currentPSS)
		}

		if len(currentPSS.Tables) == 0 {
			currentPSS.Tables = extractTables(currentPSS.Query, log)
		}

		fingerprint, err := pg_query.Fingerprint(currentPSS.Query)
		if err != nil {
			log.Errorf("query skipped: could not calculate finger print for query %v: %v", currentPSS.Query, err)
			continue
		}

		isTruncated, err := pgUtils.IsQueryTruncated(ctx, currentPSS.Query)
		if err != nil {
			log.Errorf("could not run IsQueryTruncated for %v: %v", currentPSS.Query, err)
		}

		version, err := pgUtils.GetVersion(ctx)
		if err != nil {
			log.Errorf("could not GetVersion of postgres: %v", err)
		}

		mb := &proto.MetricsBucket{
			ClusterName:  params.ClusterName,
			InstanceName: params.InstanceName,
			Database:     currentPSS.Database,
			Tables:       currentPSS.Tables,
			Username:     currentPSS.Username,
			Queryid:      strconv.FormatInt(currentPSS.QueryID, 10),
			Fingerprint:  fingerprint,
			NumQueries:   count,
			IsTruncated:  isTruncated,
			Query:        currentPSS.Query,
		}
		mb.Labels = make(map[string]string)
		mb.Labels["pg_version"] = strconv.FormatFloat(version, 'f', -1, 64)

		for _, p := range []struct {
			value float32  // result value: currentPSS.SumXXX-prevPSS.SumXXX
			sum   *float32 // MetricsBucket.XXXSum field to write value
			cnt   *float32 // MetricsBucket.XXXCnt field to write count
		}{
			// convert milliseconds to seconds
			{float32(currentPSS.TotalTime-prevPSS.TotalTime) / 1000, &mb.MQueryTimeSum, &mb.MQueryTimeCnt},
			{float32(currentPSS.Rows - prevPSS.Rows), &mb.MRowsSentSum, &mb.MRowsSentCnt},

			{float32(currentPSS.SharedBlksHit - prevPSS.SharedBlksHit), &mb.MSharedBlksHitSum, &mb.MSharedBlksHitCnt},
			{float32(currentPSS.SharedBlksRead - prevPSS.SharedBlksRead), &mb.MSharedBlksReadSum, &mb.MSharedBlksReadCnt},
			{float32(currentPSS.SharedBlksDirtied - prevPSS.SharedBlksDirtied), &mb.MSharedBlksDirtiedSum, &mb.MSharedBlksDirtiedCnt},
			{float32(currentPSS.SharedBlksWritten - prevPSS.SharedBlksWritten), &mb.MSharedBlksWrittenSum, &mb.MSharedBlksWrittenCnt},

			{float32(currentPSS.LocalBlksHit - prevPSS.LocalBlksHit), &mb.MLocalBlksHitSum, &mb.MLocalBlksHitCnt},
			{float32(currentPSS.LocalBlksRead - prevPSS.LocalBlksRead), &mb.MLocalBlksReadSum, &mb.MLocalBlksReadCnt},
			{float32(currentPSS.LocalBlksDirtied - prevPSS.LocalBlksDirtied), &mb.MLocalBlksDirtiedSum, &mb.MLocalBlksDirtiedCnt},
			{float32(currentPSS.LocalBlksWritten - prevPSS.LocalBlksWritten), &mb.MLocalBlksWrittenSum, &mb.MLocalBlksWrittenCnt},

			{float32(currentPSS.TempBlksRead - prevPSS.TempBlksRead), &mb.MTempBlksReadSum, &mb.MTempBlksReadCnt},
			{float32(currentPSS.TempBlksWritten - prevPSS.TempBlksWritten), &mb.MTempBlksWrittenSum, &mb.MTempBlksWrittenCnt},

			// convert milliseconds to seconds
			{float32(currentPSS.BlkReadTime-prevPSS.BlkReadTime) / 1000, &mb.MBlkReadTimeSum, &mb.MBlkReadTimeCnt},
			{float32(currentPSS.BlkWriteTime-prevPSS.BlkWriteTime) / 1000, &mb.MBlkWriteTimeSum, &mb.MBlkWriteTimeCnt},
		} {
			if p.value != 0 {
				*p.sum = p.value
				*p.cnt = count
			}
		}

		res = append(res, mb)
	}

	return res
}

// Changes returns channel that should be read until it is closed.
func (m *PGStatStatements) Changes() <-chan agents.StatementChange {
	return m.changes
}
