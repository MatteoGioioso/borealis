package pg

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/borealis/postgres_agent/cache"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"strconv"
	"strings"
)

const queryTag = "borealis-agent"

type PGUtils struct {
	cache *cache.CacheV2
	conn  *sqlx.DB
	log   *logrus.Entry
}

func NewPGUtils(cache *cache.CacheV2, log *logrus.Entry) *PGUtils {
	return &PGUtils{cache: cache, log: log}
}

func (pg *PGUtils) SetConn(conn *sqlx.DB) {
	pg.conn = conn
}

func (pg *PGUtils) GetConfig(ctx context.Context) {
	_, _ = pg.conn.QueryxContext(ctx, `SELECT name, setting, unit, vartype FROM pg_settings;`)
}

func (pg *PGUtils) GetDatabases(ctx context.Context) ([]Database, error) {
	const key = "postgres:databases"
	dbs := make([]Database, 0)

	databasesRes, err := pg.cache.Get(ctx, key)
	if err != nil {
		return dbs, fmt.Errorf("could not Get from cache: %v", err)
	}
	if databasesRes != "" {
		if err := json.Unmarshal([]byte(databasesRes), &dbs); err != nil {
			return dbs, fmt.Errorf("could not Unmarshal: %v", err)
		}

		return dbs, nil
	}
	pg.log.Warnf("cache miss for %v", key)

	rows, err := pg.conn.QueryxContext(ctx, `SELECT datname FROM pg_database WHERE datistemplate = false;`)
	if err != nil {
		return dbs, fmt.Errorf("could not run QueryxContext: %v", err)
	}

	for rows.Next() {
		var val string
		if err := rows.Scan(&val); err != nil {
			return dbs, fmt.Errorf("could not Scan %v", err)
		}

		dbs = append(dbs, Database{Name: val})
	}

	marshalDbs, err := json.Marshal(dbs)
	if err != nil {
		return nil, err
	}

	return dbs, pg.cache.Set(ctx, key, marshalDbs)
}

func (pg *PGUtils) GetQuerySize(ctx context.Context) (int, error) {
	const key = "postgres:track_activity_query_size_bytes"
	trackActivityQuerySize, err := pg.cache.Get(ctx, key)
	if err != nil {
		return 0, fmt.Errorf("could not Get from cache: %v", err)
	}
	if trackActivityQuerySize != "" {
		return strconv.Atoi(trackActivityQuerySize)
	}
	pg.log.Warnf("cache miss for %v", key)

	rows, err := pg.conn.QueryxContext(ctx, "SHOW track_activity_query_size")
	if err != nil {
		return 0, err
	}

	vals := make([]string, 0)
	for rows.Next() {
		var val string
		if err := rows.Scan(&val); err != nil {
			return 0, fmt.Errorf("could not Scan %v", err)
		}

		vals = append(vals, val)
	}

	trackActivityQuerySizeStr := vals[0]
	var trackActivityQuerySizeVal int
	if strings.Contains(trackActivityQuerySizeStr, "B") {
		trackActivityQuerySizeVal, err = strconv.Atoi(strings.ReplaceAll(trackActivityQuerySizeStr, "B", ""))
	}
	if strings.Contains(trackActivityQuerySizeStr, "kB") {
		trackActivityQuerySizeVal, err = strconv.Atoi(strings.ReplaceAll(trackActivityQuerySizeStr, "kB", ""))
		trackActivityQuerySizeVal = trackActivityQuerySizeVal * 1024
	}
	if strings.Contains(trackActivityQuerySizeStr, "MB") {
		trackActivityQuerySizeVal, err = strconv.Atoi(strings.ReplaceAll(trackActivityQuerySizeStr, "MB", ""))
		trackActivityQuerySizeVal = trackActivityQuerySizeVal * 1048576
	}
	if err != nil {
		return 0, fmt.Errorf("could not convert %v to int from %v: %v", trackActivityQuerySizeVal, trackActivityQuerySizeStr, err)
	}
	if err := pg.cache.Set(ctx, key, []byte(strconv.Itoa(trackActivityQuerySizeVal))); err != nil {
		return 0, fmt.Errorf("could not Set to cache: %v", err)
	}

	return trackActivityQuerySizeVal, nil
}

func (pg *PGUtils) GetVersion(ctx context.Context) (pgVersion float64, err error) {
	const key = "postgres:version"
	vFromCache, err := pg.cache.Get(ctx, key)
	if err != nil {
		return 0, fmt.Errorf("could not get version from cache: %v", err)
	}
	if vFromCache != "" {
		atoi, err := strconv.ParseFloat(vFromCache, 64)
		if err != nil {
			return 0, fmt.Errorf("could not convert %v to float: %v", vFromCache, err)
		}
		return atoi, nil
	}
	pg.log.Warnf("cache miss for %v", key)

	var v string
	err = pg.conn.QueryRow(fmt.Sprintf("SELECT /* %s */ version()", queryTag)).Scan(&v)
	if err != nil {
		return
	}
	v = ParsePostgreSQLVersion(v)
	if err := pg.cache.Set(ctx, key, []byte(v)); err != nil {
		return 0, fmt.Errorf("could not cache %v: %v", v, err)
	}

	return strconv.ParseFloat(v, 64)
}

func (pg *PGUtils) IsQueryTruncated(ctx context.Context, query string) (bool, error) {
	maxQueryLength, err := pg.GetQuerySize(ctx)
	if err != nil {
		return false, fmt.Errorf("could not getQuerySize: %v", err)
	}

	queryLength := len([]rune(query))
	// Postgres cut the query one char before thus if 1024 it will cut at 1023
	if queryLength < maxQueryLength-1 {
		return false, nil
	}

	return true, nil
}
