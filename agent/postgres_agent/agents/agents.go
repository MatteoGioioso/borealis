package agents

import (
	"time"

	"github.com/borealis/commons/proto"
)

// StatementChange represents built-in Agent status change and/or collect request.
type StatementChange struct {
	MetricsSample []*proto.MetricsBucket
}

// ActivityChange represents built-in Agent status change.
type ActivityChange struct {
	ActivitiesSamples []*proto.ActivitySample
}

// Params represent Agent parameters.
type Params struct {
	AgentID                          string
	InstanceName                     string
	InstanceHost                     string
	ClusterName                      string
	CollectorHost                    string
	ActivitySamplingIntervalSeconds  time.Duration
	StatementSamplingIntervalSeconds time.Duration
	RegisterIntervalSeconds          time.Duration
	PgVersion                        string
	LogLocation                      string
	GrpcAddress                      string
}
