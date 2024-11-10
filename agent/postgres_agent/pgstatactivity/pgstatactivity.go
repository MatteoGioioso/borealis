package pgstatactivity

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/agents"
	"github.com/borealis/postgres_agent/cache"
	"github.com/borealis/postgres_agent/os_metrics"
	"github.com/borealis/postgres_agent/pg"
	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"math"
	"time"
)

type PgStatActivity struct {
	q             *sqlx.DB
	agentID       string
	l             *logrus.Entry
	changes       chan agents.ActivityChange
	params        *agents.Params
	metricsGetter os_metrics.MetricsGetter
	pgUtils       *pg.PGUtils
}

func New(db *sql.DB, params *agents.Params, l *logrus.Entry, metricsGetter os_metrics.MetricsGetter, v2 *cache.CacheV2) *PgStatActivity {
	conn := sqlx.NewDb(db, "postgres")
	pgUtils := pg.NewPGUtils(v2, l)
	pgUtils.SetConn(conn)

	return &PgStatActivity{
		q:             conn,
		agentID:       params.AgentID,
		l:             l,
		changes:       make(chan agents.ActivityChange),
		params:        params,
		metricsGetter: metricsGetter,
		pgUtils:       pgUtils,
	}
}

func (pg *PgStatActivity) getActivity(ctx context.Context) ([]ActivityDB, error) {
	query := `SELECT 
	   current_timestamp,
	   query_id,
       datname,
       pid,
       usesysid,
       usename,
       application_name,
       backend_type,
       COALESCE(client_hostname, client_addr::text, 'localhost') AS client_hostname,
       wait_event_type,
       wait_event,
       query,
       state,
       query_start,
       1000 * EXTRACT(EPOCH FROM (clock_timestamp() - query_start)) AS duration
FROM pg_stat_activity sa
WHERE state = 'active' AND pid != pg_backend_pid();`

	row, err := pg.q.QueryxContext(ctx, query)
	if err != nil {
		return nil, err
	}

	as := make([]ActivityDB, 0)
	for row.Next() {
		a := ActivityDB{}
		if err := row.StructScan(&a); err != nil {
			return nil, err
		}

		as = append(as, a)
	}

	return as, nil
}

func (pg *PgStatActivity) getSample(ctx context.Context, periodStart time.Time, periodLengthSecs uint32) ([]*proto.ActivitySample, error) {
	activities, err := pg.getActivity(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not getActivity: %v", err)
	}
	periodStartSecs := uint32(periodStart.Unix())
	cpuCores, err := pg.metricsGetter.GetCPU()
	if err != nil {
		return nil, fmt.Errorf("could not GetCPU: %v", err)
	}

	samples := make([]*proto.ActivitySample, 0)
	for _, activity := range activities {
		if activity.IsExplainQuery() {
			continue
		}

		isQueryTruncated, err := pg.pgUtils.IsQueryTruncated(ctx, activity.GetQuery())
		if err != nil {
			pg.l.Errorf("could not run isQueryTruncated: %v", err)
		}
		sample, err := activity.ToActivitySample(isQueryTruncated, periodLengthSecs, periodStartSecs, pg.params, cpuCores)
		if err != nil {
			pg.l.Errorf("could not convert ToActivitySample, skipping sample: %v", err)
			continue
		}
		samples = append(samples, sample)
	}

	return samples, nil
}

func (pg *PgStatActivity) Run(ctx context.Context) {
	defer func() {
		pg.q.Close()
		close(pg.changes)
	}()

	start := time.Now()
	wait := start.Truncate(pg.params.ActivitySamplingIntervalSeconds).Add(pg.params.ActivitySamplingIntervalSeconds).Sub(start)
	pg.l.Infof("Started run collection in %s.", wait)
	t := time.NewTimer(wait)
	defer t.Stop()

	for {
		select {
		case <-ctx.Done():
			pg.l.Infof("Context canceled.")
			return

		case <-t.C:
			lengthS := uint32(math.Round(wait.Seconds()))
			sample, err := pg.getSample(ctx, start, lengthS)

			pg.l.Debugf("Got %v samples", len(sample))
			start = time.Now()
			wait = start.Truncate(pg.params.ActivitySamplingIntervalSeconds).Add(pg.params.ActivitySamplingIntervalSeconds).Sub(start)
			pg.l.Debugf("Scheduling next collection in %s at %s.", wait, start.Add(wait).Format("15:04:05"))
			t.Reset(wait)

			if err != nil {
				pg.l.Errorf("could not getSample: %v", err)
				continue
			}

			pg.changes <- agents.ActivityChange{ActivitiesSamples: sample}
		}
	}
}

func (pg *PgStatActivity) Changes() <-chan agents.ActivityChange {
	return pg.changes
}
