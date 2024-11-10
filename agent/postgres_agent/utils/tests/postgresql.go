package tests

import (
	"database/sql"
	"github.com/borealis/postgres_agent/pg"
	"net"
	"net/url"
	"strconv"
	"testing"

	_ "github.com/lib/pq" // register SQL driver
	"github.com/stretchr/testify/require"
)

// GetTestPostgreSQLDSN returns DNS for PostgreSQL test database.
func GetTestPostgreSQLDSN(tb testing.TB) string {
	tb.Helper()

	if testing.Short() {
		tb.Skip("-short flag is passed, skipping test with real database.")
	}
	q := make(url.Values)
	q.Set("sslmode", "disable") // TODO: make it configurable

	u := &url.URL{
		Scheme:   "postgres",
		Host:     net.JoinHostPort("localhost", strconv.Itoa(5432)),
		Path:     "collector",
		User:     url.UserPassword("collector-agent", "collector-agent-password"),
		RawQuery: q.Encode(),
	}

	return u.String()
}

// OpenTestPostgreSQL opens connection to PostgreSQL test database.
func OpenTestPostgreSQL(tb testing.TB) *sql.DB {
	tb.Helper()

	db, err := sql.Open("postgres", GetTestPostgreSQLDSN(tb))
	require.NoError(tb, err)

	db.SetMaxIdleConns(10)
	db.SetMaxOpenConns(10)
	db.SetConnMaxLifetime(0)

	waitForFixtures(tb, db)

	return db
}

// PostgreSQLVersion returns major PostgreSQL version (e.g. "9.6", "10", etc.).
func PostgreSQLVersion(tb testing.TB, db *sql.DB) string {
	tb.Helper()

	var v string
	err := db.QueryRow("SELECT /* collector-agent-tests:PostgreSQLVersion */ version()").Scan(&v)
	require.NoError(tb, err)

	m := pg.ParsePostgreSQLVersion(v)
	require.NotEmpty(tb, m, "Failed to parse PostgreSQL version from %q.", v)
	tb.Logf("version = %q (m = %q)", v, m)
	return m
}
