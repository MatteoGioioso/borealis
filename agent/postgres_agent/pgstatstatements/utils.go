package pgstatstatements

import (
	"github.com/borealis/postgres_agent/pg"
	"time"

	"github.com/AlekSi/pointer"
	"github.com/sirupsen/logrus"
	"gopkg.in/reform.v1"

	"github.com/borealis/postgres_agent/cache"
	"github.com/borealis/postgres_agent/parser"
)

// statementsCache is a wrapper for cache.Cache to use only with statementsMap type
type statementsCache struct {
	cache *cache.Cache
}

func (c *statementsCache) Set(src statementsMap) error {
	return c.cache.Set(src)
}

func (c *statementsCache) Get(dest statementsMap) error {
	return c.cache.Get(dest)
}

func newStatementsCache(typ statementsMap, retain time.Duration, sizeLimit uint, l *logrus.Entry) (*statementsCache, error) {
	c, err := cache.New(typ, retain, sizeLimit, l)
	return &statementsCache{c}, err
}

func queryDatabases(q *reform.Querier) map[int64]string {
	structs, err := q.SelectAllFrom(pgStatDatabaseView, "")
	if err != nil {
		return nil
	}

	res := make(map[int64]string, len(structs))
	for _, str := range structs {
		d := str.(*pgStatDatabase)
		res[d.DatID] = pointer.GetString(d.DatName)
	}
	return res
}

func queryUsernames(q *reform.Querier) map[int64]string {
	structs, err := q.SelectAllFrom(pgUserView, "")
	if err != nil {
		return nil
	}

	res := make(map[int64]string, len(structs))
	for _, str := range structs {
		u := str.(*pgUser)
		res[u.UserID] = pointer.GetString(u.UserName)
	}
	return res
}

func extractTables(query string, l *logrus.Entry) []string {
	start := time.Now()
	t, _ := pg.Query(query)
	tables, err := parser.ExtractTables(query)
	if err != nil {
		// log full query and error stack on debug level or more
		if l.Logger.GetLevel() >= logrus.DebugLevel {
			l.Debugf("Can't extract table names from query %s: %+v", query, err)
		} else {
			l.Warnf("Can't extract table names from query %s: %s", t, err)
		}

		return []string{} // not-nil to cache for the current iteration
	}

	dur := time.Since(start)
	logf := l.Debugf
	if dur > 500*time.Millisecond {
		logf = l.Warnf
	}
	logf("Extracted table names %v from query %s. It took %s.", tables, t, dur)
	return tables
}
