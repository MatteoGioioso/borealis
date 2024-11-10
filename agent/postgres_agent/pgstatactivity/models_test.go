package pgstatactivity

import (
	pg_query "github.com/pganalyze/pg_query_go/v4"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestPgQuery(t *testing.T) {
	const input = `UPDATE pgbench_accounts SET abalance = abalance + -1517 WHERE aid = 522663;`
	normalize, err := pg_query.Normalize(input)
	if err != nil {
		t.Fatal(err)
	}
	fingerprint1, err := pg_query.Fingerprint(input)
	if err != nil {
		t.Fatal(err)
	}
	fingerprint2, err := pg_query.Fingerprint(normalize)
	if err != nil {
		t.Fatal(err)
	}
	assert.Equal(t, fingerprint1, fingerprint2)
	assert.Equal(t, normalize, `UPDATE pgbench_accounts SET abalance = abalance + $1 WHERE aid = $2;`)
}

func Test_isExplainable(t *testing.T) {
	for _, ts := range []struct {
		query string
		want  bool
	}{
		{
			`UPDATE pgbench_accounts SET abalance = abalance + -1517 WHERE aid = 522663;`,
			true,
		},
		{
			`  UPDATE pgbench_accounts SET abalance = abalance + -1517 WHERE aid = 522663;`,
			true,
		},
		{
			`VACUMM public.pgbench_accounts`,
			false,
		},
		{
			`EXPLAIN (ANALYSE) UPDATE pgbench_accounts SET abalance = abalance + -1517 WHERE aid = 522663;`,
			false,
		},
	} {
		t.Run(ts.query, func(t *testing.T) {
			assert.Equal(t, isExplainable(ts.query), ts.want)
		})
	}
}
