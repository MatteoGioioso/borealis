package os_metrics

import "os"

const (
	cpuCores = "cpu_cores"
)

type Params struct {
	InstanceName  string
	Namespace     string
	ContainerName string
}

type Metric struct {
	Name        string
	Value       float32
	Unit        string
	Description string
}

type MetricsGetter interface {
	GetCPU() (Metric, error)
	Init() error
}

func GetOSMetricsProvider() MetricsGetter {
	if _, isRunningInKubernetes := os.LookupEnv("KUBERNETES_SERVICE_HOST"); isRunningInKubernetes {
		return KubernetesMetrics{}
	}

	return VMMetrics{}
}
