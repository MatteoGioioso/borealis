package collector

import (
	"context"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/agents"
	"github.com/borealis/postgres_agent/module"
	"github.com/sirupsen/logrus"
	"time"
)

const ModuleName = "collector"

type Module struct {
	Log    *logrus.Entry
	Client proto.CollectorClient

	*agents.Params
}

func (a *Module) Init(args module.InitArgs) error {
	a.Client = proto.NewCollectorClient(args.GrpcConn)
	a.Log = args.Log.
		WithField("module", ModuleName).
		WithField("cluster", args.Params.ClusterName).
		WithField("instance", args.Params.InstanceName)
	a.Log.Info("init")
	a.Params = args.Params
	return nil
}

func (a *Module) Run(ctx context.Context) {}

func (a *Module) Send(ctx context.Context) {
	tick := time.NewTicker(a.RegisterIntervalSeconds)
	defer tick.Stop()

	for {
		select {
		case <-ctx.Done():
			a.Log.Warning("context done, interrupting registration module")
			break
		case <-tick.C:
			if _, err := a.Client.Register(ctx, &proto.RegisterRequest{
				ClusterName:   a.ClusterName,
				InstanceName:  a.InstanceName,
				InstanceHost:  a.InstanceHost,
				CollectorHost: a.CollectorHost,
			}); err != nil {
				a.Log.Errorf("could not Register collector: %v", err)
			}
		}
	}
}
