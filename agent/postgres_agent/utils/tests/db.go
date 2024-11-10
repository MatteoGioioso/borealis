package tests

import (
	"database/sql"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

// waitForFixtures waits up to 30 seconds to database fixtures (test_db) to be loaded.
func waitForFixtures(tb testing.TB, db *sql.DB) {
	tb.Helper()

	var id int
	var err error
	for i := 0; i < 30; i++ {
		if err = db.QueryRow("SELECT /* collector-agent-tests:waitForFixtures */ id FROM city LIMIT 1").Scan(&id); err == nil {
			return
		}
		time.Sleep(time.Second)
	}
	require.NoError(tb, err)
}
