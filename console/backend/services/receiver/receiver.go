package receiver

import (
	"github.com/borealis/backend/modules"
	"github.com/borealis/commons/credentials"
	"github.com/borealis/commons/proto"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

// This module is responsible for receiving metrics from the postgres_agents

const ModuleName = "receiver"

type Module struct {
	Log                 *logrus.Entry
	CredentialsProvider credentials.Credentials
}

func (m *Module) Register(log *logrus.Entry, db *sqlx.DB, credentialsProvider credentials.Credentials, params modules.Params) {
	m.Log = log.WithField("module", ModuleName)
	m.Log.Infof("registered")
}

func (m *Module) Init(initArgs modules.InitArgs) error {
	service := Service{
		log:         m.Log,
		cacheClient: initArgs.Cache,
	}

	proto.RegisterCollectorServer(initArgs.GrpcServer, &service)
	m.Log.Infof("initialized")
	return nil
}
