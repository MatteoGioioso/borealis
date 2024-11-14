package config

import (
	"fmt"
	"gopkg.in/alecthomas/kingpin.v2"
	"gopkg.in/yaml.v3"
	"log"
	"os"
	"strings"
	"time"
)

var (
	borealisDir = kingpin.Flag("borealis-dir", "").
		Envar("BOREALIS_DIR").
		Default("/borealis").
		String()
	activitySamplingInterval = kingpin.Flag("activity-sampling-interval", "").
		Envar("ACTIVITY_SAMPLING_INTERVAL").
		Default("1000ms").
		Duration()
	statementSamplingInterval = kingpin.Flag("statement-sampling-interval", "").
		Envar("STATEMENT_SAMPLING_INTERVAL").
		Default(time.Minute.String()).
		Duration()
	registerInterval = kingpin.Flag("register-interval", "interval at which the collector will register itself").
		Envar("REGISTER_INTERVAL").
		Default(time.Minute.String()).
		Duration()
	tlsStrategy = kingpin.Flag("tls-strategy", "").
		Envar("TLS_STRATEGY").
		Default("noop").
		Enum("autogenerate", "custom", "noop")

	lokiHost = kingpin.Flag("loki-host", "").
		Envar("LOKI_HOST").
		Required().
		String()
	lokiPort = kingpin.Flag("loki-port", "").
		Envar("LOKI_PORT").
		Default("3100").
		String()
	prometheusHost = kingpin.Flag("prometheus-host", "").
		Envar("PROMETHEUS_HOST").
		Required().
		String()
	prometheusPort = kingpin.Flag("prometheus-port", "").
		Envar("PROMETHEUS_PORT").
		Default("3100").
		String()
	borealisHost = kingpin.Flag("borealis-host", "").
		Envar("BOREALIS_HOST").
		Required().
		String()
	borealisPort = kingpin.Flag("borealis-port", "").
		Envar("BOREALIS_PORT").
		Default("3100").
		String()

	configFilepath = kingpin.Flag("config-filepath", "").
		Envar("CONFIG_FILEPATH").
		String()
	instanceNames = kingpin.Flag("instance_names", "comma separated list").
		Envar("INSTANCE_NAMES").
		String()
)

type Instance struct {
	ClusterName   string `yaml:"clusterName"`
	InstanceName  string `yaml:"instanceName"`
	PgVersion     string `yaml:"pgVersion"`
	PgLogLocation string `yaml:"pgLogLocation"`

	Hostname string `yaml:"hostname"`
	Port     string `yaml:"port"`
	Username string `yaml:"username"`
	Password string `yaml:"password"`
	Database string `yaml:"database"`

	PatroniPort string `yaml:"patroniPort"`

	// Internals
	ExporterHostname string
	ExporterPort     string
	PromtailHost     string `yaml:"promtailHost"`
	PromtailPort     string `yaml:"promtailPort"`
}

type Config struct {
	Instances []Instance `yaml:"instances"`

	PrometheusHost string `yaml:"prometheusHost"`
	PrometheusPort string `yaml:"prometheusPort"`

	BorealisHost string `yaml:"borealisHost"`
	BorealisPort string `yaml:"borealisPort"`

	LokiHost string `yaml:"lokiHost"`
	LokiPort string `yaml:"lokiPort"`

	ActivitySamplingIntervalMs int    `yaml:"activitySamplingIntervalMs"`
	StatementSamplingIntervalS int    `yaml:"statementSamplingInterval"`
	RegisterIntervalS          int    `yaml:"registerInterval"`
	BorealisDir                string `yaml:"borealisDir"`
}

func init() {
	kingpin.Parse()
}

func New() (*Config, error) {
	conf := Config{}

	if *configFilepath != "" {
		return conf.fromFile(*configFilepath)
	}
	return conf.fromEnv(*instanceNames)
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
		pgLogLocation := kingpin.
			Flag(fmt.Sprintf("%v-%v", instanceName, "pg-log-location"), "").
			Envar(fmt.Sprintf("%v_%v", instanceName, "PG_LOG_LOCATION")).
			Default("/logs/postgres/*.csv").
			String()

		instance := Instance{
			ClusterName:   os.Getenv(clusterName),
			InstanceName:  instanceName,
			PgVersion:     os.Getenv(pgVersion),
			PgLogLocation: *pgLogLocation,
			Hostname:      os.Getenv(host),
			Port:          os.Getenv(port),
			Username:      os.Getenv(user),
			Password:      os.Getenv(password),
			Database:      os.Getenv(database),
			PatroniPort:   os.Getenv(patroniPort),
		}

		instances = append(instances, instance)
	}

	c.Instances = instances
	c.BorealisHost = os.Getenv("BOREALIS_HOST")
	c.BorealisPort = os.Getenv("BOREALIS_PORT")
	c.PrometheusHost = *prometheusHost
	c.PrometheusPort = *prometheusPort
	c.BorealisDir = *borealisDir
	c.ActivitySamplingIntervalMs = int((*activitySamplingInterval).Milliseconds())
	c.StatementSamplingIntervalS = int((*statementSamplingInterval).Seconds())
	c.RegisterIntervalS = int((*registerInterval).Seconds())
	c.LokiHost = *lokiHost
	c.LokiPort = *lokiPort
	c.BorealisHost = *borealisHost
	c.BorealisPort = *borealisPort

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
			return fmt.Errorf("could not validate config: cluster name is required")
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
