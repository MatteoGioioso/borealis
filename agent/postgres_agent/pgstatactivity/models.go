package pgstatactivity

import (
	"database/sql"
	"fmt"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/agents"
	"github.com/borealis/postgres_agent/os_metrics"
	"github.com/borealis/postgres_agent/pg"
	pg_query "github.com/pganalyze/pg_query_go/v4"
	"strconv"
	"strings"
	"time"
)

type ActivityDB struct {
	QueryId          sql.NullInt64  `db:"query_id"`
	QuerySha         string         `db:"query_sha"`
	CurrentTimestamp time.Time      `db:"current_timestamp"`
	Database         sql.NullString `db:"datname"`
	PID              int64          `db:"pid"`
	UserSysID        sql.NullString `db:"usesysid"`
	Username         sql.NullString `db:"usename"`
	ApplicationName  sql.NullString `db:"application_name"`
	BackendType      sql.NullString `db:"backend_type"`
	ClientHostname   sql.NullString `db:"client_hostname"`
	WaitEventType    sql.NullString `db:"wait_event_type"`
	WaitEvent        sql.NullString `db:"wait_event"`
	Query            sql.NullString `db:"query"`
	State            sql.NullString `db:"state"`
	QueryStart       time.Time      `db:"query_start"`
	Duration         float64        `db:"duration"`
}

func (ac *ActivityDB) GetWaitEventClassAndType() struct {
	weType  string
	weClass string
} {
	var waitEventType, waitEvent string
	if !ac.WaitEventType.Valid || ac.WaitEventType.String == "" {
		waitEventType = "CPU"
	} else {
		waitEventType = ac.WaitEventType.String
	}

	if !ac.WaitEvent.Valid || ac.WaitEvent.String == "" {
		waitEvent = "CPU"
	} else {
		waitEvent = ac.WaitEvent.String
	}

	return struct {
		weType  string
		weClass string
	}{
		weType:  waitEventType,
		weClass: waitEvent,
	}
}

// https://github.com/dbacvetkov/PASH-Viewer/blob/b1072b4894627719e1fb783fc3fc9ae95bb00c35/src/org/ash/database/ASHDatabasePG10.java#L243
func (ac *ActivityDB) GetQuery() string {
	backendType := ac.BackendType
	program := ac.ApplicationName
	query := ac.Query
	if !query.Valid || query.String == "" {
		if program.Valid && program.String == "pg_basebackup" {
			query.String = "backup"
		} else if program.Valid && (program.String == "walreceiver" || program.String == "walsender") {
			query.String = "wal"
		} else if backendType.Valid && (backendType.String == "walreceiver" || backendType.String == "walsender") {
			query.String = "wal"
		} else if backendType.Valid && (backendType.String == "autovacuum worker" || backendType.String == "autovacuum launcher") {
			query.String = "autovacuum"
		} else if backendType.Valid && (backendType.String == "checkpointer") {
			query.String = "checkpoint"
		} else {
			query.String = program.String
		}
	}

	return query.String
}

func (ac *ActivityDB) GetQuerySha() string {
	return pg.GetQuerySha(ac.GetQuery())
}

func (ac *ActivityDB) GetTimestamp() uint32 {
	return uint32(ac.CurrentTimestamp.Unix())
}
func (ac *ActivityDB) GetQueryStart() uint32 {
	return uint32(ac.QueryStart.Unix())
}

func (ac *ActivityDB) IsExplainQuery() bool {
	return strings.Contains(strings.ToLower(ac.GetQuery()), "explain")
}

func (ac *ActivityDB) ToActivitySample(
	isQueryTruncated bool,
	periodLengthSecs, periodStartSecs uint32,
	params *agents.Params,
	cpuCores os_metrics.Metric,
) (*proto.ActivitySample, error) {
	var err error
	var fingerprint, parsedQuery string

	query := ac.GetQuery()
	explainable := isExplainable(query)
	if explainable {
		fingerprint, err = pg_query.Fingerprint(query)
		if err != nil {
			return nil, fmt.Errorf("could not calculate Fingerprint of %v: %v", query, err)
		}

		parsedQuery, err = pg_query.Normalize(query)
		if err != nil {
			return nil, fmt.Errorf("could not Normalize query %v: %v", query, err)
		}
	} else {
		fingerprint = query
		parsedQuery = query
	}

	return &proto.ActivitySample{
		Fingerprint:      fingerprint,
		ParsedQuery:      parsedQuery,
		Query:            ac.GetQuery(),
		QueryId:          strconv.Itoa(int(ac.QueryId.Int64)),
		QuerySha:         ac.GetQuerySha(),
		IsQueryTruncated: isQueryTruncated,
		IsNotExplainable: !explainable,

		ClusterName:     params.ClusterName,
		InstanceName:    params.InstanceName,
		InstanceHost:    params.InstanceHost,
		Datname:         ac.Database.String,
		ApplicationName: ac.ApplicationName.String,
		BackendType:     ac.BackendType.String,
		ClientHostname:  ac.ClientHostname.String,
		Usename:         ac.Username.String,
		Usesysid:        ac.UserSysID.String,
		Pid:             uint32(ac.PID),
		CollectorHost:   params.CollectorHost,

		WaitEventType: ac.GetWaitEventClassAndType().weType,
		WaitEvent:     ac.GetWaitEventClassAndType().weClass,
		State:         ac.State.String,

		QueryStart:          ac.GetQueryStart(),
		Duration:            float32(ac.Duration),
		CurrentTimestamp:    ac.GetTimestamp(),
		PeriodStartUnixSecs: periodStartSecs,
		PeriodLengthSecs:    periodLengthSecs,

		CpuCores: cpuCores.Value,
	}, nil
}

func isExplainable(query string) bool {
	query = strings.ToLower(query)
	query = strings.ReplaceAll(query, " ", "")

	for key, _ := range explainableStatementMap {
		if strings.HasPrefix(query, key) {
			return true
		}
	}

	return false
}

var explainableStatementMap = map[string]bool{
	"select": true,
	"update": true,
	"delete": true,
	"insert": true,
}
