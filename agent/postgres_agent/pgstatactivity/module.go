package pgstatactivity

import (
	"context"
	"github.com/borealis/commons/proto"
	"github.com/borealis/postgres_agent/module"
	"github.com/sirupsen/logrus"
	"time"
)

const ModuleName = "pgstatactivity"

type ActivityModule struct {
	Log            *logrus.Entry
	ActivityClient proto.ActivityCollectorClient
	ActivityAgent  *PgStatActivity
}

func (a *ActivityModule) Init(args module.InitArgs) error {
	a.Log = args.Log.
		WithField("module", ModuleName).
		WithField("cluster", args.Params.ClusterName).
		WithField("instance", args.Params.InstanceName)

	a.Log.Info("init")
	a.ActivityAgent = New(args.InstanceConn, args.Params, a.Log, args.OsMetrics, args.Cache)
	a.ActivityClient = proto.NewActivityCollectorClient(args.GrpcConn)
	return nil
}

func (a *ActivityModule) Run(ctx context.Context) {
	go a.ActivityAgent.Run(ctx)
}

func (a *ActivityModule) Send(ctx context.Context) {
	tick := time.NewTicker(time.Minute)
	defer tick.Stop()

	batch := make([]*proto.ActivitySample, 0)
	for {
		select {
		case change := <-a.ActivityAgent.Changes():
			if change.ActivitiesSamples != nil {
				batch = append(batch, change.ActivitiesSamples...)
			}
		case <-tick.C:
			if len(batch) == 0 {
				continue
			}
			// TODO improve error handling here:
			// do not flush the batch if there is an error
			// TODO not sure this is the best wait to batch results from a channel
			a.Log.Infof("collected %v samples, flushing and sending", len(batch))
			resp, err := a.ActivityClient.Collect(ctx, &proto.ActivityCollectRequest{ActivitySamples: batch})
			if err != nil {
				a.Log.Error(err)
			}
			if resp == nil {
				a.Log.Warn("Failed to send Activity samples request")
			}

			batch = make([]*proto.ActivitySample, 0)
		}
	}
}
