package main

import (
	"github.com/borealis/agent/config/pkg"
	"gopkg.in/alecthomas/kingpin.v2"
	"log"
	"os"
	"text/template"
	"time"
)

var (
	activitySamplingInterval = kingpin.Flag("activity_sampling_interval", "").
					Envar("ACTIVITY_SAMPLING_INTERVAL").
					Default("1000ms").
					Duration()

	statementSamplingInterval = kingpin.Flag("statement_sampling_interval", "").
					Envar("STATEMENT_SAMPLING_INTERVAL").
					Default(time.Minute.String()).
					Duration()
	registerInterval = kingpin.Flag("register_interval", "interval at which the collector will register itself").
				Envar("REGISTER_INTERVAL").
				Default(time.Minute.String()).
				Duration()

	vmAgentConfigFilePath = kingpin.Flag("config-file-path", "").
				Envar("VMAGENT_CONFIG_FILE_PATH").
				Default("/borealis/config/prometheus.yml").
				String()
	vmAgentConfigTemplateFilePath = kingpin.Flag("config-template-file-path", "").
					Envar("CONFIG_TEMPLATE_FILE_PATH").
					Default("/borealis/config/vmagent-config-template.yml").
					String()
	postgresExporterConfigFilePath = kingpin.Flag("postgres-exporter-config-file-path", "").
					Envar("POSTGRES_EXPORTER_CONFIG_FILE_PATH").
					Default("/borealis/config/postgres_exporter.yml").
					String()
	postgresExporterConfigTemplateFilePath = kingpin.Flag("postgres-exporter-config-template-file-path", "").
						Envar("POSTGRES_EXPORTER_CONFIG_TEMPLATE_FILE_PATH").
						Default("/borealis/config/postgesexporter-config-template.yml").
						String()

	configFilepath = kingpin.Flag("config-filepath", "").
			Envar("CONFIG_FILEPATH").
			Default("/config/config.yaml").
			String()

	tlsStrategy = kingpin.Flag("tls-strategy", "").
			Envar("TLS_STRATEGY").
			Default("noop").
			Enum("autogenerate", "custom", "noop")

	// Via env variables
	clusters = kingpin.Flag("cluster_names", "comma separated list").
			Envar("CLUSTER_NAMES").
			Required().
			String()
)

func main() {
	kingpin.Parse()

	templateConfig, err := config.New(*configFilepath, *clusters)
	if err != nil {
		log.Fatalf("could not read config file: %v", err)
	}

	GenerateFile(templateConfig, *postgresExporterConfigTemplateFilePath, *postgresExporterConfigFilePath)
	log.Printf("postgres exporter config created and stored at: %v", *postgresExporterConfigFilePath)

	GenerateFile(templateConfig, *vmAgentConfigTemplateFilePath, *vmAgentConfigFilePath)
	log.Printf("vmagent config created and stored at: %v", *vmAgentConfigFilePath)
}

func GenerateFile(config any, templatePath string, destFile string) {
	t, err := template.ParseFiles(templatePath)
	if err != nil {
		log.Fatalf("could not parse template: %v", err)
	}

	f, err := os.Create(destFile)
	if err != nil {
		log.Fatalf("could not create file: %v", err)
	}

	err = t.Execute(f, config)
	if err != nil {
		log.Fatalf("could not execute template: %v", err)
	}
}
