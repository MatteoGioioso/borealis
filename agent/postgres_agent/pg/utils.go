package pg

import (
	"crypto/sha1"
	"database/sql"
	"encoding/hex"
	"regexp"
	"strings"
)

// regexps to extract version numbers from the `SELECT version()` output
var (
	postgresDBRegexp = regexp.MustCompile(`PostgreSQL ([\d\.]+)`)
)

func ParsePostgreSQLVersion(v string) string {
	m := postgresDBRegexp.FindStringSubmatch(v)
	if len(m) != 2 {
		return ""
	}

	parts := strings.Split(m[1], ".")
	switch len(parts) {
	case 1: // major only
		return parts[0]
	case 2: // major and patch
		return parts[0]
	case 3: // major, minor, and patch
		return parts[0] + "." + parts[1]
	default:
		return ""
	}
}

func GetQuerySha(query string) string {
	sha := sha1.New()
	re := regexp.MustCompile(`\r?\n`)

	query = strings.ToLower(query)
	query = re.ReplaceAllString(query, "")
	query = strings.ReplaceAll(query, " ", "")

	sha.Write([]byte(query))

	return hex.EncodeToString(sha.Sum(nil))
}

func SetupDB(dsn string) (*sql.DB, error) {
	sqlDB, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetMaxOpenConns(2)
	sqlDB.SetConnMaxLifetime(0)
	return sqlDB, err
}

var maxQueryLengthInternal = 2048

// Query limits passed query string to 2048 Unicode runes, truncating it if necessary.
func Query(q string) (query string, truncated bool) {
	runes := []rune(q)
	if len(runes) <= maxQueryLengthInternal {
		return string(runes), false
	}

	return string(runes[:maxQueryLengthInternal-4]) + " ...", true
}
