package module

import (
	"context"
	"database/sql"
	"github.com/borealis/postgres_agent/agents"
	"github.com/borealis/postgres_agent/cache"
	"github.com/borealis/postgres_agent/os_metrics"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
)

type Module interface {
	Init(args InitArgs) error

	Run(ctx context.Context)

	Send(ctx context.Context)
}

type InitArgs struct {
	GrpcConn     *grpc.ClientConn
	InstanceConn *sql.DB
	OsMetrics    os_metrics.MetricsGetter
	Log          *logrus.Entry
	Cache        *cache.CacheV2
	Params       *agents.Params
}
