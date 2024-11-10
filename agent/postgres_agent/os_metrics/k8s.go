package os_metrics

import (
	"context"
	"github.com/borealis/commons/k8sutil"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"runtime"
)

type KubernetesMetrics struct {
	Client k8sutil.KubernetesClient
	Params
}

// GetCPU If the Container has no upper bound on the CPU resources it can use. The Container could use all the
// CPU resources available on the Node where it is running.
// The Container is running in a namespace that has a default CPU limit, and the Container is automatically assigned
// the default limit.
func (k KubernetesMetrics) GetCPU() (Metric, error) {
	pod, err := k.Client.
		PodMetricses(k.Namespace).
		Get(context.Background(), k.InstanceName, v1.GetOptions{})
	if err != nil {
		return Metric{}, err
	}

	for _, container := range pod.Containers {
		if container.Name == k.ContainerName {
			value := container.Usage.Cpu().Value()
			if value == 0 {
				value = int64(runtime.NumCPU())
			}

			return Metric{
				Name:        cpuCores,
				Value:       float32(value),
				Unit:        "",
				Description: "Number of virtual cores",
			}, err
		}
	}

	return Metric{}, err
}

func (k KubernetesMetrics) Init() error {
	client, err := k8sutil.InitializeKubeClient()
	if err != nil {
		return err
	}

	k.Client = client
	return nil
}
