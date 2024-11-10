package commands

import (
	"context"
	"fmt"
	"github.com/borealis/agent/config/pkg"
	"github.com/borealis/commons/postgresql"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/pg"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
	"strings"
)

type Service struct {
	Log     *logrus.Entry
	config  *config.Config
	pgUtils *pg.PGUtils

	proto.CommandsServer
}

func (s *Service) Command(ctx context.Context, request *proto.CommandRequest) (*proto.CommandResponse, error) {
	switch request.ActionType {
	case proto.ActionTypes_EXPLAIN:
		plan, err := s.runExplain(ctx, request.GetPlanRequest())
		if err != nil {
			return nil, err
		}

		return &proto.CommandResponse{
			ActionType: request.ActionType,
			Message: &proto.CommandResponse_PlanResponse{PlanResponse: &proto.PlanResponse{
				Plan: plan,
			}},
		}, nil
	case proto.ActionTypes_GET_DATABASES:
		databases, err := s.runGetDatabases(ctx, request.GetGetDatabasesRequest())
		if err != nil {
			return nil, fmt.Errorf("could not runGetDatabases: %v", err)
		}

		return &proto.CommandResponse{
			ActionType: request.ActionType,
			Message: &proto.CommandResponse_GetDatabasesResponse{GetDatabasesResponse: &proto.GetDatabasesCommandResponse{
				Databases: databases,
			}},
		}, nil
	default:
		s.Log.Infof("action type %v, does not exist, skipping", request.ActionType)
		return nil, nil
	}
}

func (s *Service) runExplain(
	ctx context.Context,
	planRequest *proto.PlanRequest,
) (string, error) {
	instanceConn, err := s.getConn(planRequest.InstanceName, planRequest.Database)
	if err != nil {
		return "", fmt.Errorf("could not getConn: %v", err)
	}
	defer instanceConn.Close()

	tx, err := instanceConn.BeginTx(ctx, nil)
	if err != nil {
		return "", fmt.Errorf("could not run transaction: %v", err)
	}
	defer tx.Rollback()

	s.Log.Debugf("explaining: %v", planRequest.Query)

	rows, err := tx.Query(fmt.Sprintf("EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON) %v", planRequest.Query))
	if err != nil {
		return "", fmt.Errorf("could not run EXPLAIN query: %v", err)
	}

	var sb strings.Builder

	for rows.Next() {
		var s string
		if err := rows.Scan(&s); err != nil {
			return "", fmt.Errorf("could not scan row: %v", err)
		}
		sb.WriteString(s)
		sb.WriteString("\n")
	}

	// In case of UPDATE, DELETE or INSERT we don't want to persist the changes
	if err := tx.Rollback(); err != nil {
		return "", fmt.Errorf("could not roll back transaction: %v", err)
	}

	s.Log.Debugf("found plan %v for query %v", sb.String(), planRequest.Query)

	return sb.String(), nil
}

func (s *Service) runGetDatabases(ctx context.Context, request *proto.GetDatabasesCommandRequest) ([]*proto.Database, error) {
	instanceConn, err := s.getConn(request.InstanceName, "postgres")
	if err != nil {
		return nil, fmt.Errorf("could not getConn: %v", err)
	}
	defer instanceConn.Close()

	s.pgUtils.SetConn(instanceConn)

	databases, err := s.pgUtils.GetDatabases(ctx)
	if err != nil {
		return nil, fmt.Errorf("could not GetDatabases: %v", err)
	}

	dbs := make([]*proto.Database, 0)
	for _, database := range databases {
		dbs = append(dbs, &proto.Database{Name: database.Name})
	}

	return dbs, nil
}

func (s *Service) getConn(instanceName, database string) (*sqlx.DB, error) {
	instance := s.config.GetInstance(instanceName)
	if instance == nil {
		return nil, fmt.Errorf("instance %v, was not found in config", instanceName)
	}

	pg := postgresql.V2{}
	return pg.GetConnection(postgresql.Args{
		Username: instance.Username,
		Password: instance.Password,
		Database: database,
		Port:     instance.Port,
		Host:     instance.Hostname,
	})
}
