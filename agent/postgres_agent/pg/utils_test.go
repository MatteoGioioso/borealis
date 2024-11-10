package pg

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestParsePostgreSQLVersion(t *testing.T) {
	for v, expected := range map[string]string{
		"PostgreSQL 12beta2 (Debian 12~beta2-1.pgdg100+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 8.3.0-6) 8.3.0, 64-bit":              "12",
		"PostgreSQL 10.9 (Debian 10.9-1.pgdg90+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 6.3.0-18+deb9u1) 6.3.0 20170516, 64-bit":     "10",
		"PostgreSQL 9.4.23 on x86_64-pc-linux-gnu (Debian 9.4.23-1.pgdg90+1), compiled by gcc (Debian 6.3.0-18+deb9u1) 6.3.0 20170516, 64-bit": "9.4",
	} {
		t.Run(v, func(t *testing.T) {
			actual := ParsePostgreSQLVersion(v)
			assert.Equal(t, expected, actual, "%s", v)
		})
	}
}

func TestQuery(t *testing.T) {
	m := maxQueryLengthInternal
	maxQueryLengthInternal = 5
	defer func() {
		maxQueryLengthInternal = m
	}()

	for q, expected := range map[string]struct {
		query     string
		truncated bool
	}{
		"абвг":    {"абвг", false},
		"абвгд":   {"абвгд", false},
		"абвгде":  {"а ...", true},
		"абвгдеё": {"а ...", true},

		// Unicode replacement characters
		"\xff\xff\xff\xff\xff":     {"\uFFFD\uFFFD\uFFFD\uFFFD\uFFFD", false},
		"\xff\xff\xff\xff\xff\xff": {"\uFFFD ...", true},
	} {
		query, truncated := Query(q)
		assert.Equal(t, expected.query, query)
		assert.Equal(t, expected.truncated, truncated)
	}
}

func TestGetQuerySha(t *testing.T) {
	type args struct {
		query string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{name: "normal string", args: args{query: `hello world`}, want: "6adfb183a4a2c94a2f92dab5ade762a47889a5a1"},
		{
			name: "query",
			args: args{query: `SELECT *
FROM pgbench_accounts
         JOIN public.pgbench_branches pb on pgbench_accounts.bid = pb.bid
ORDER BY abalance`},
			want: "8736be4b0c06122bab9a08ee1c9225504fd9c277",
		},
		{
			name: "query",
			args: args{query: `select *   from pgbench_accounts join public.pgbench_branches pb ON pgbench_accounts.bid = pb.bid ORDER BY abalance`},
			want: "8736be4b0c06122bab9a08ee1c9225504fd9c277",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			sha := GetQuerySha(tt.args.query)
			fmt.Println(sha)
			assert.Equalf(t, tt.want, sha, "GetQuerySha(%v)", tt.args.query)
		})
	}
}
