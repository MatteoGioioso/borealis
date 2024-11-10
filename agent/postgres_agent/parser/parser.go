package parser

import (
	"fmt"
	"regexp"
	"sort"
	"strings"

	pgquery "github.com/pganalyze/pg_query_go/v4"
	"github.com/pkg/errors"
)

// ExtractTables extracts postgres table names from the query.
func ExtractTables(query string) ([]string, error) {
	var err error
	var tables []string

	defer func() {
		if r := recover(); r != nil {
			err = errors.WithStack(fmt.Errorf("panic: %v", r))
		}
	}()

	var jsonTree string
	if jsonTree, err = pgquery.ParseToJSON(query); err != nil {
		err = errors.Wrap(err, "error on parsing sql query")
		return nil, err
	}

	var res []string
	tableNames := make(map[string]struct{})
	res, err = extract(jsonTree, `"relname":"`, `"`)
	if err != nil {
		return nil, err
	}
	for _, v := range res {
		tableNames[v] = struct{}{}
	}
	res, err = extract(jsonTree, `"ctename":"`, `"`)
	if err != nil {
		return nil, err
	}
	for _, v := range res {
		delete(tableNames, v)
	}

	for k := range tableNames {
		tables = append(tables, k)
	}
	sort.Strings(tables)

	return tables, nil
}

func extract(query, pre, post string) ([]string, error) {
	re, err := regexp.Compile(fmt.Sprintf("(%s)(.*?)(%s)", pre, post))
	if err != nil {
		return nil, err
	}

	match := re.FindAll([]byte(query), -1)
	tables := make([]string, 0, len(match))
	for _, v := range match {
		tables = append(tables, parseValue(string(v), pre, post))
	}

	return tables, nil
}

func parseValue(v, pre, post string) string {
	v = strings.ReplaceAll(v, pre, "")
	return strings.ReplaceAll(v, post, "")
}
