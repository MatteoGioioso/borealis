package activities

import (
	"fmt"
	"github.com/borealis/backend/modules"
	"github.com/borealis/backend/services/shared"
	"github.com/borealis/commons/credentials"
	"github.com/borealis/commons/proto"
	"github.com/jmoiron/sqlx"
	"github.com/sirupsen/logrus"
)

const ModuleName = "activities"

type Module struct {
	Log *logrus.Entry
	DB  *sqlx.DB

	modules.Params
}

func (m *Module) Register(log *logrus.Entry, db *sqlx.DB, credentialsProvider credentials.Credentials, params modules.Params) {
	m.Log = log.WithField("module", ModuleName)
	m.DB = db
	m.Log.Infof("registered")
	m.Params = params
}

func (m *Module) Init(initArgs modules.InitArgs) error {
	activitiesProfilerService := NewService(
		NewActivitiesRepository(m.DB),
		shared.NewMetricsRepository(m.DB),
		LoadWaitEventsMapFromFile(m.WaitEventsMapFilePath),
		m.Log,
	)
	activityCollectorService := &ActivityCollectorService{
		ActivitySampler: NewActivitySampler(m.DB, m.Log),
		Log:             m.Log,
	}
	proto.RegisterActivityCollectorServer(initArgs.GrpcServer, activityCollectorService)
	proto.RegisterActivitiesServer(initArgs.GrpcServer, activitiesProfilerService)
	if err := proto.RegisterActivitiesHandlerFromEndpoint(initArgs.Ctx, initArgs.Mux, initArgs.GrpcAddress, initArgs.Opts); err != nil {
		return fmt.Errorf("could not RegisterActivitiesHandlerFromEndpoint: %v", err)
	}

	return nil
}
