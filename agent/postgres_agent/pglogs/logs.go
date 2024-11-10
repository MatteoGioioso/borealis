package pglogs

import (
	"context"
	"fmt"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/agents"
	"github.com/fsnotify/fsnotify"
	"github.com/papertrail/go-tail/follower"
	"github.com/sirupsen/logrus"
	"io"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

type SelfHostedLogStreamItem struct {
	Line               string
	LogLineNumberChunk int32
}

type PgLogs struct {
	Logger          *logrus.Entry
	parsedLogStream chan *proto.ParsedLogLine
	logStream       chan SelfHostedLogStreamItem
	LogLocation     string
	params          agents.Params
}

func New(params agents.Params, logger *logrus.Entry) PgLogs {
	return PgLogs{
		Logger:          logger,
		LogLocation:     params.LogLocation,
		parsedLogStream: make(chan *proto.ParsedLogLine),
		logStream:       make(chan SelfHostedLogStreamItem),
		params:          params,
	}
}

func (l *PgLogs) Changes() chan *proto.ParsedLogLine {
	return l.parsedLogStream
}

func (l *PgLogs) Run(ctx context.Context) error {
	go l.setupLogTransformer(ctx)
	return l.setupLogLocationTail(ctx)
}

func (l *PgLogs) setupLogTransformer(ctx context.Context) {
	var incompleteLine string
	for {
		select {
		case <-ctx.Done():
			return
		case item, ok := <-l.logStream:
			if !ok {
				return
			}
			incompleteLine += item.Line
			// If there is an error parsing the logs, it means that it has been printed in multiple lines,
			// thus we keep composing the line until it is parsable
			// TODO: this might need to be more robust, what if for some reasons it will keep failing?
			// We will have a cascade effect. We might need to add a timeout to avoid this
			logLine, err := ParseLogLine(incompleteLine)
			if err != nil {
				l.Logger.Debugf("could not parse log line (%v), skipping: %v", item.Line, err)
				continue
			} else {
				l.parsedLogStream <- l.transformLogLine(logLine)
				incompleteLine = ""
			}
		}
	}
}

func (l *PgLogs) transformLogLine(line LogLine) *proto.ParsedLogLine {
	logTime, err := GetSecondsFromStringTimestamp(line.LogTime)
	if err != nil {
		// Best effort, if for some reason we cannot parse we will assume the log was recorded now
		l.Logger.Errorf("could not parse log_time: %v", err)
		logTime = uint32(time.Now().Unix())
	}

	sessionStartTime, err := GetSecondsFromStringTimestamp(line.SessionStartTime)
	if err != nil {
		l.Logger.Errorf("could not parse session_start_time: %v", err)
		sessionStartTime = 0
	}

	internalQueryPos, err := ConvertStringToInt32(line.InternalQueryPos)
	if err != nil {
		l.Logger.Errorf("could not convert internal_query_pos value %v: %v", line.InternalQueryPos, err)
	}

	queryPos, err := ConvertStringToInt32(line.QueryPos)
	if err != nil {
		l.Logger.Errorf("could not convert query_pos value %v: %v", line.QueryPos, err)
	}

	return &proto.ParsedLogLine{
		LogTime:              logTime,
		UserName:             line.UserName,
		DatabaseName:         line.DatabaseName,
		ProcessId:            uint32(line.ProcessId),
		ConnectionFrom:       line.ConnectionFrom,
		SessionId:            line.SessionId,
		SessionLineNum:       int32(line.SessionLineNum),
		CommandTag:           line.CommandTag,
		SessionStartTime:     sessionStartTime,
		VirtualTransactionId: line.VirtualTransactionId,
		TransactionId:        int32(line.TransactionId),
		ErrorSeverity:        line.ErrorSeverity,
		SqlStateCode:         line.SqlStateCode,
		Message:              line.Message,
		Detail:               line.Detail,
		Hint:                 line.Hint,
		InternalQuery:        line.InternalQuery,
		InternalQueryPos:     internalQueryPos,
		Context:              line.Context,
		Query:                line.Query,
		QueryPos:             queryPos,
		Location:             line.Location,
		ApplicationName:      line.ApplicationName,
		BackendType:          line.BackendType,
		LeaderPid:            line.LeaderPid,
		QueryId:              line.QueryId,
		ClusterName:          l.params.ClusterName,
		InstanceName:         l.params.InstanceName,
	}
}

func (l *PgLogs) tailFile(ctx context.Context, path string) error {
	l.Logger.Printf("Tailing log file %s", path)

	t, err := follower.New(path, follower.Config{
		Whence: io.SeekEnd,
		Offset: 0,
		Reopen: true,
	})
	if err != nil {
		return fmt.Errorf("failed to setup log tail: %s", err)
	}

	go func() {
		defer t.Close()
	TailLoop:
		for {
			select {
			case line := <-t.Lines():
				l.logStream <- SelfHostedLogStreamItem{Line: line.String()}
			case <-ctx.Done():
				l.Logger.Printf("Stopping log tail for %s (stop requested)", path)
				break TailLoop
			}
		}
		if t.Err() != nil {
			l.Logger.Errorf("Failed log file tail: %s", t.Err())
		}
	}()

	return nil
}

func isAcceptableLogFile(fileName string, fileNameFilter string) bool {
	if fileNameFilter != "" && fileName != fileNameFilter {
		return false
	}

	if strings.HasSuffix(fileName, ".csv") {
		return true
	}

	return false
}

func filterOutString(strings []string, stringToBeRemoved string) []string {
	newStrings := []string{}
	for _, str := range strings {
		if str != stringToBeRemoved {
			newStrings = append(newStrings, str)
		}
	}
	return newStrings
}

const maxOpenTails = 10

func (l *PgLogs) setupLogLocationTail(ctx context.Context) error {
	l.Logger.Printf("Searching for log file(s) in %s", l.LogLocation)

	openFiles := make(map[string]context.CancelFunc)
	openFilesByAge := []string{}
	fileNameFilter := ""

	statInfo, err := os.Stat(l.LogLocation)
	if err != nil {
		return err
	} else if !statInfo.IsDir() {
		fileNameFilter = l.LogLocation
		l.LogLocation = filepath.Dir(l.LogLocation)
	}

	files, err := os.ReadDir(l.LogLocation)
	if err != nil {
		return err
	}

	sort.Slice(files, func(i, j int) bool {
		// Note that we are sorting descending here, i.e. we want the newest files
		// first
		infoI, _ := files[i].Info()
		infoJ, _ := files[j].Info()
		return infoI.ModTime().After(infoJ.ModTime())
	})

	for _, f := range files {
		if f.IsDir() {
			continue
		}

		if len(openFiles) >= maxOpenTails {
			break
		}

		fileName := path.Join(l.LogLocation, f.Name())

		if isAcceptableLogFile(fileName, fileNameFilter) {
			tailCtx, tailCancel := context.WithCancel(ctx)
			err = l.tailFile(tailCtx, fileName)
			if err != nil {
				tailCancel()
				l.Logger.Printf("ERROR - %s", err)
			} else {
				openFiles[fileName] = tailCancel
				openFilesByAge = append(openFilesByAge, fileName)
			}
		}
	}

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return fmt.Errorf("fsnotify new: %s", err)
	}

	go func() {
		defer watcher.Close()
		for {
			select {
			case event := <-watcher.Events:
				//logger.PrintVerbose("Received fsnotify event: %s %s", event.Op.String(), event.Name)
				if event.Op&fsnotify.Create == fsnotify.Create || event.Op&fsnotify.Write == fsnotify.Write {
					_, exists := openFiles[event.Name]
					if isAcceptableLogFile(event.Name, fileNameFilter) && !exists {
						if len(openFiles) >= maxOpenTails {
							var oldestFile string
							oldestFile, openFilesByAge = openFilesByAge[0], openFilesByAge[1:]
							tailCancel, ok := openFiles[oldestFile]
							if ok {
								tailCancel()
								delete(openFiles, oldestFile)
							}
						}
						tailCtx, tailCancel := context.WithCancel(ctx)
						err = l.tailFile(tailCtx, event.Name)
						if err != nil {
							tailCancel()
							l.Logger.Errorf("ERROR - %s", err)
						} else {
							openFiles[event.Name] = tailCancel
							openFilesByAge = append(openFilesByAge, event.Name)
						}
					}
				}
				if event.Op&fsnotify.Remove == fsnotify.Remove || event.Op&fsnotify.Rename == fsnotify.Rename || event.Op&fsnotify.Chmod == fsnotify.Chmod {
					tailCancel, ok := openFiles[event.Name]
					if ok {
						tailCancel()
						delete(openFiles, event.Name)
					}
					openFilesByAge = filterOutString(openFilesByAge, event.Name)
				}
			case err = <-watcher.Errors:
				l.Logger.Errorf("ERROR - fsnotify watcher failure: %s", err)
			case <-ctx.Done():
				l.Logger.Printf("Log file fsnotify watcher received stop signal")
				for fileName, tailCancel := range openFiles {
					// TODO: This cancel might actually not be necessary since we are
					// already canceling the parent context?
					tailCancel()
					delete(openFiles, fileName)
				}
				openFilesByAge = []string{}
				return
			}
		}
	}()

	err = watcher.Add(l.LogLocation)
	if err != nil {
		return fmt.Errorf("fsnotify add \"%s\": %s", l.LogLocation, err)
	}

	return nil
}

func GetSecondsFromStringTimestamp(timestamp string) (uint32, error) {
	parsedTime, err := time.Parse("2006-01-02 15:04:05.999999999 UTC", timestamp)
	if err != nil {
		return 0, err
	}
	return uint32(parsedTime.Unix()), nil
}

func ConvertStringToInt32(val string) (int32, error) {
	if val == "" {
		return 0, nil
	}

	out, err := strconv.Atoi(val)
	if err != nil {
		return 0, err
	}

	return int32(out), err
}
