package main

import (
	"database/sql"
	"fmt"
	"github.com/borealis/agent/config/pkg"
	"github.com/borealis/commons/logger"
	"github.com/borealis/commons/postgresql"
	"github.com/borealis/postgres_agent/agents"
	"github.com/borealis/postgres_agent/cache"
	"github.com/borealis/postgres_agent/collector"
	"github.com/borealis/postgres_agent/commands"
	"github.com/borealis/postgres_agent/module"
	"github.com/borealis/postgres_agent/os_metrics"
	pg2 "github.com/borealis/postgres_agent/pg"
	"github.com/borealis/postgres_agent/pgstatactivity"
	"github.com/borealis/postgres_agent/pgstatstatements"
	"github.com/borealis/postgres_agent/utils"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"gopkg.in/alecthomas/kingpin.v2"
	"sync"
)

var (
	configFilepath = kingpin.Flag("config-filepath", "").
		Envar("CONFIG_FILEPATH").
		Default("/config/config.yaml").
		String()

	logLevelRaw = kingpin.Flag("log-level", "").
		Envar("LOG_LEVEL").
		Default("info").
		Enum("debug", "info", "warning")

	// TODO Might not be needed
	collectorHost = kingpin.Flag("collector-host", "").
		Envar("COLLECTOR_HOST").
		Default("localhost:8083").
		String()

	grpcServerPort = kingpin.Flag("grpc-server-port", "").
		Envar("GRPC_SERVER_PORT").
		Default("8083").
		String()

	// Via env variables
	instances = kingpin.Flag("instance_names", "comma separated list").
		Envar("INSTANCE_NAMES").
		Required().
		String()
)

func ParseFlags() {
	kingpin.Parse()
}

func main() {
	ParseFlags()
	log := logger.NewDefaultLogger(*logLevelRaw, "agent")
	log.Info("starting")

	grpcAddress := ":" + (*grpcServerPort)

	modules := []module.Module{
		&pgstatstatements.StatementModule{},
		&pgstatactivity.ActivityModule{},
		&collector.Module{},
	}

	ctx := utils.GetContext(log)

	conf, err := config.New(*configFilepath, *instances)
	if err != nil {
		log.Fatalln(err)
	}

	grpcConn, err := grpc.NewClient(conf.GetBorealisHost(), grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalln(err)
	}

	osMetricsGetter := os_metrics.GetOSMetricsProvider()
	if err := osMetricsGetter.Init(); err != nil {
		log.Fatalln(err)
	}

	instancesConns := make(map[string]*sql.DB)

	for _, instance := range conf.Instances {
		instanceName := instance.InstanceName
		pg := postgresql.V2{}
		instanceDSN, err := pg.GetDSN(postgresql.Args{
			Username: instance.Username,
			Password: instance.Password,
			Database: instance.Database,
			Port:     instance.Port,
			Host:     instance.Hostname,
		})
		if err != nil {
			log.Fatalln(err)
		}

		instanceConn, err := pg2.SetupDB(instanceDSN)
		if err != nil {
			log.Fatalln(err)
		}

		instancesConns[instanceName] = instanceConn

		params := &agents.Params{
			AgentID:                          fmt.Sprintf("%v__%v", instance.ClusterName, instanceName),
			InstanceName:                     instanceName,
			ClusterName:                      instance.ClusterName,
			CollectorHost:                    *collectorHost,
			InstanceHost:                     instance.Hostname + ":" + instance.Port,
			ActivitySamplingIntervalSeconds:  conf.GetActivitySamplingInterval(),
			StatementSamplingIntervalSeconds: conf.GetStatementSamplingInterval(),
			RegisterIntervalSeconds:          conf.GetRegisterInterval(),
			PgVersion:                        instance.PgVersion,
			GrpcAddress:                      grpcAddress,
		}

		cacheV2 := cache.NewV2(cache.Params{})

		for _, mod := range modules {
			if err := mod.Init(module.InitArgs{
				GrpcConn:     grpcConn,
				InstanceConn: instanceConn,
				OsMetrics:    osMetricsGetter,
				Log:          log,
				Cache:        cacheV2,
				Params:       params,
			}); err != nil {
				log.Fatalln(err)
			}

			go mod.Run(ctx)

			var wg sync.WaitGroup

			wg.Add(1)

			go func(module module.Module) {
				defer wg.Done()
				module.Send(ctx)
			}(mod)
		}
	}

	commandModule := commands.CommandModule{}
	if err := commandModule.Init(conf, &agents.Params{GrpcAddress: grpcAddress}, log); err != nil {
		log.Fatalln(err)
	}

	go commandModule.Run(ctx)

	select {
	case <-ctx.Done():
		log.Warnf("closing connection")

		for instanceName, instanceConn := range instancesConns {
			log.Infof("closing connection to postgres instance %v", instanceName)
			if err := instanceConn.Close(); err != nil {
				log.Errorf("could not close the connection to db: %v", err)
			}
		}

		if err := grpcConn.Close(); err != nil {
			log.Errorf("could not close the connection: %v", err)
		}
		return
	}
}
