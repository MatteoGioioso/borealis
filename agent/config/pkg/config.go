package config

import (
	"fmt"
	"gopkg.in/yaml.v3"
	"log"
	"os"
	"strings"
	"time"
)

type Instance struct {
	ClusterName  string `yaml:"clusterName"`
	InstanceName string `yaml:"instanceName"`
	PgVersion    string `json:"pgVersion"`

	Hostname string `yaml:"hostname"`
	Port     string `yaml:"port"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Database string `yaml:"database"`

	PatroniPort string `yaml:"patroniPort"`

	// Internals
	ExporterHostname string
	ExporterPort     string
	LokiHost         string `yaml:"lokiHost"`
	LokiPort         string `yaml:"lokiPort"`
	PromtailHost     string `yaml:"promtailHost"`
	PromtailPort     string `yaml:"promtailPort"`
}

type Config struct {
	Instances []Instance `yaml:"instances"`

	PrometheusHost string `yaml:"prometheusHost"`
	PrometheusPort string `yaml:"prometheusPort"`

	BorealisHost string `yaml:"borealisHost"`
	BorealisPort string `yaml:"borealisPort"`

	ActivitySamplingIntervalMs int `yaml:"activitySamplingIntervalMs"`
	StatementSamplingIntervalS int `yaml:"statementSamplingInterval"`
	RegisterIntervalS          int `yaml:"registerInterval"`
}

func New(configFilepath string, instanceNames string) (*Config, error) {
	conf := Config{}

	if fromEnv, err := conf.fromEnv(instanceNames); err == nil {
		return fromEnv, nil
	} else {
		log.Printf("error loading config from envvariables: %v, trying config file", err)
	}

	return conf.fromFile(configFilepath)
}

func (c *Config) fromEnv(instanceNames string) (*Config, error) {
	instances := make([]Instance, 0)
	for _, instanceName := range strings.Split(instanceNames, ",") {
		password := fmt.Sprintf("%v_%v", instanceName, "PASSWORD")
		user := fmt.Sprintf("%v_%v", instanceName, "USERNAME")
		clusterName := fmt.Sprintf("%v_%v", instanceName, "CLUSTER_NAME")
		host := fmt.Sprintf("%v_%v", instanceName, "HOST")
		port := fmt.Sprintf("%v_%v", instanceName, "PORT")
		database := fmt.Sprintf("%v_%v", instanceName, "DATABASE")
		pgVersion := fmt.Sprintf("%v_%v", instanceName, "PG_VERSION")
		patroniPort := fmt.Sprintf("%v_%v", instanceName, "PATRONI_PORT")

		instance := Instance{
			ClusterName:      os.Getenv(clusterName),
			InstanceName:     instanceName,
			PgVersion:        os.Getenv(pgVersion),
			Hostname:         os.Getenv(host),
			Port:             os.Getenv(port),
			Username:         os.Getenv(user),
			Password:         os.Getenv(password),
			Database:         os.Getenv(database),
			PatroniPort:      os.Getenv(patroniPort),
			ExporterHostname: "",
			ExporterPort:     "",
		}

		instances = append(instances, instance)
	}

	c.Instances = instances
	c.BorealisHost = os.Getenv("BOREALIS_HOST")
	c.BorealisPort = os.Getenv("BOREALIS_PORT")
	c.PrometheusHost = os.Getenv("PROMETHEUS_HOST")
	c.PrometheusPort = os.Getenv("PROMETHEUS_PORT")

	if err := c.validate(); err != nil {
		return nil, err
	}

	return c, nil
}

func (c *Config) fromFile(configFilepath string) (*Config, error) {
	configFile, err := os.ReadFile(configFilepath)
	if err != nil {
		return nil, fmt.Errorf("could not ReadFile config: %v", err)
	}
	if err := yaml.Unmarshal(configFile, &c); err != nil {
		return nil, fmt.Errorf("invalid config, could not Unmarshal: %v", err)
	}

	if err := c.validate(); err != nil {
		return nil, fmt.Errorf("could not validate: %v", err)
	}

	return c, nil
}

func (c *Config) validate() error {
	for i, instance := range c.Instances {
		if instance.ClusterName == "" {
			return fmt.Errorf("could not validate config: instance name and cluster name are required")
		}

		if instance.Port == "" {
			log.Printf("port not provided for instance %v, defaulting to 5432", instance.ClusterName)
			c.Instances[i].Port = "5432"
		}

		if instance.PatroniPort == "" {
			log.Printf("patroni port not provided for instance %v, defaulting to 8008", instance.ClusterName)
			c.Instances[i].PatroniPort = "8008"
		}

		// Internals
		if instance.ExporterHostname == "" {
			c.Instances[i].ExporterHostname = "localhost"
		}

		if instance.ExporterPort == "" {
			c.Instances[i].ExporterPort = "9187"
		}

		if instance.LokiHost == "" {
			instance.LokiHost = "localhost"
		}

		if instance.LokiPort == "" {
			instance.LokiPort = "3100"
		}
	}

	if c.PrometheusHost == "" {
		return fmt.Errorf("could not validate config: prometheus host is required")
	}

	if c.PrometheusPort == "" {
		return fmt.Errorf("could not validate config: prometheus port is required")
	}

	if c.BorealisHost == "" {
		return fmt.Errorf("could not validate config: borealis host is required")
	}

	if c.BorealisPort == "" {
		return fmt.Errorf("could not validate config: borealis port is required")
	}

	if c.ActivitySamplingIntervalMs == 0 {
		c.ActivitySamplingIntervalMs = 1000
	}

	if c.StatementSamplingIntervalS == 0 {
		c.StatementSamplingIntervalS = 60
	}

	if c.RegisterIntervalS == 0 {
		c.RegisterIntervalS = 60
	}

	return nil
}

func (c *Config) GetInstance(instanceName string) *Instance {
	for _, instance := range c.Instances {
		if instance.InstanceName == instanceName {
			return &instance
		}
	}
	return nil
}

func (c *Config) GetBorealisHost() string {
	return c.BorealisHost + ":" + c.BorealisPort
}

func (c *Config) GetActivitySamplingInterval() time.Duration {
	return time.Duration(c.ActivitySamplingIntervalMs) * time.Millisecond
}

func (c *Config) GetStatementSamplingInterval() time.Duration {
	return time.Duration(c.StatementSamplingIntervalS) * time.Second
}

func (c *Config) GetRegisterInterval() time.Duration {
	return time.Duration(c.RegisterIntervalS) * time.Second
}
