package os_metrics

import "runtime"

type VMMetrics struct{}

func (V VMMetrics) GetCPU() (Metric, error) {
	numberOfCores := runtime.NumCPU()
	return Metric{
		Name:        cpuCores,
		Value:       float32(numberOfCores),
		Unit:        "Count",
		Description: "Number of virtual cores",
	}, nil
}

func (V VMMetrics) Init() error {
	return nil
}
