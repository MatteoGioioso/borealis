package info

import (
	"fmt"
	"github.com/borealis/backend/modules"
	"github.com/borealis/commons/credentials"
	"github.com/borealis/commons/proto"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

const ModuleName = "info"

type Module struct {
	DB                  *sqlx.DB
	Log                 *logrus.Entry
	CredentialsProvider credentials.Credentials
}

func (m *Module) Register(log *logrus.Entry, db *sqlx.DB, credentialsProvider credentials.Credentials, params modules.Params) {
	m.Log = log.WithField("module", ModuleName)
	m.DB = db
	m.CredentialsProvider = credentialsProvider
	m.Log.Infof("registered")
}

func (m *Module) Init(initArgs modules.InitArgs) error {
	service := Service{
		log:         m.Log,
		cacheClient: initArgs.Cache,
	}

	proto.RegisterInfoServer(initArgs.GrpcServer, &service)
	if err := proto.RegisterInfoHandlerFromEndpoint(initArgs.Ctx, initArgs.Mux, initArgs.GrpcAddress, initArgs.Opts); err != nil {
		return fmt.Errorf("could not register InfoHandlerFromEndpoint: %v", err)
	}
	m.Log.Infof("initialized")

	return nil
}
