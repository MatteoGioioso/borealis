package pglogs

import (
	"encoding/csv"
	"github.com/jszwec/csvutil"
	"strings"
)

type LogLine struct {
	LogTime              string `csv:"log_time"`
	UserName             string `csv:"user_name"`
	DatabaseName         string `csv:"database_name"`
	ProcessId            int    `csv:"process_id"`
	ConnectionFrom       string `csv:"connection_from"`
	SessionId            string `csv:"session_id"`
	SessionLineNum       int    `csv:"session_line_num"`
	CommandTag           string `csv:"command_tag"`
	SessionStartTime     string `csv:"session_start_time"`
	VirtualTransactionId string `csv:"virtual_transaction_id"`
	TransactionId        int    `csv:"transaction_id"`
	ErrorSeverity        string `csv:"error_severity"`
	SqlStateCode         string `csv:"sql_state_code"`
	Message              string `csv:"message"`
	Detail               string `csv:"detail"`
	Hint                 string `csv:"hint"`
	InternalQuery        string `csv:"internal_query"`
	InternalQueryPos     string `csv:"internal_query_pos"`
	Context              string `csv:"context"`
	Query                string `csv:"query"`
	QueryPos             string `csv:"query_pos"`
	Location             string `csv:"location"`
	ApplicationName      string `csv:"application_name"`
	BackendType          string `csv:"backend_type"`
	LeaderPid            string `csv:"leader_pid"`
	QueryId              string `csv:"query_id"`
}

func ParseLogLine(line string) (LogLine, error) {
	csvReader := csv.NewReader(strings.NewReader(line))

	// in real application this should be done once in init function.
	userHeader, err := csvutil.Header(LogLine{}, "csv")
	if err != nil {
		return LogLine{}, err
	}

	dec, err := csvutil.NewDecoder(csvReader, userHeader...)
	if err != nil {
		return LogLine{}, err
	}

	var ll LogLine
	if err := dec.Decode(&ll); err != nil {
		return LogLine{}, err
	}

	return ll, nil
}
