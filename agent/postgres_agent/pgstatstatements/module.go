package pgstatstatements

import (
	"context"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/module"
	"github.com/sirupsen/logrus"
)

type StatementModule struct {
	Log             *logrus.Entry
	StatementClient proto.StatementsCollectorClient
	StatementAgent  *PGStatStatements
}

const ModuleName = "pgstatstatements"

func (s *StatementModule) Init(args module.InitArgs) error {
	s.Log = args.Log.
		WithField("module", ModuleName).
		WithField("cluster", args.Params.ClusterName).
		WithField("instance", args.Params.InstanceName)

	s.Log.Info("init")
	statementAgent, err := New(args.InstanceConn, args.Params, s.Log, args.Cache)
	if err != nil {
		return err
	}
	s.StatementAgent = statementAgent
	s.StatementClient = proto.NewStatementsCollectorClient(args.GrpcConn)
	return nil
}

func (s *StatementModule) Run(ctx context.Context) {
	go s.StatementAgent.Run(ctx)
}

func (s *StatementModule) Send(ctx context.Context) {
	for collect := range s.StatementAgent.Changes() {
		resp, err := s.StatementClient.Collect(ctx, &proto.StatementsCollectRequest{MetricsBucket: collect.MetricsSample})
		if err != nil {
			s.Log.Error(err)
			continue
		}
		if resp == nil {
			s.Log.Warn("Failed to send Statement Collect request.")
		}
	}
	s.Log.Infof("Supervisor Statement Send() channel drained.")
}
