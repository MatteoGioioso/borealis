package main

import (
	"github.com/borealis/agent/config/pkg"
	"gopkg.in/alecthomas/kingpin.v2"
	"log"
	"os"
	"text/template"
)

var (
	vmAgentConfigFilePath = kingpin.Flag("vmagent-config-file-path", "").
				Envar("VMAGENT_CONFIG_FILE_PATH").
				Default("/borealis/config/prometheus.yml").
				String()
	vmAgentConfigTemplateFilePath = kingpin.Flag("vmagent-config-template-file-path", "").
					Envar("VMAGENT_CONFIG_TEMPLATE_FILE_PATH").
					Default("/borealis/config/vmagent-config-template.yml").
					String()
	postgresExporterConfigFilePath = kingpin.Flag("postgres-exporter-config-file-path", "").
					Envar("POSTGRES_EXPORTER_CONFIG_FILE_PATH").
					Default("/borealis/config/postgres-exporter.yml").
					String()
	postgresExporterConfigTemplateFilePath = kingpin.Flag("postgres-exporter-config-template-file-path", "").
						Envar("POSTGRES_EXPORTER_CONFIG_TEMPLATE_FILE_PATH").
						Default("/borealis/config/postgres-exporter-config-template.yml").
						String()
	promtailConfigFilePath = kingpin.Flag("promtail-config-file-path", "").
				Envar("PROMTAIL_CONFIG_FILE_PATH").
				Default("/borealis/config/promtail.yml").
				String()
	promtailConfigTemplateFilePath = kingpin.Flag("promtail-config-template-file-path", "").
					Envar("PROMTAIL_CONFIG_TEMPLATE_FILE_PATH").
					Default("/borealis/config/promtail-config-template.yml").
					String()
)

func main() {
	kingpin.Parse()

	templateConfig, err := config.New()
	if err != nil {
		log.Fatalf("could not load config: %v", err)
	}

	GenerateFile(templateConfig, *postgresExporterConfigTemplateFilePath, *postgresExporterConfigFilePath)
	log.Printf("postgres exporter config created and stored at: %v", *postgresExporterConfigFilePath)

	GenerateFile(templateConfig, *vmAgentConfigTemplateFilePath, *vmAgentConfigFilePath)
	log.Printf("vmagent config created and stored at: %v", *vmAgentConfigFilePath)

	GenerateFile(templateConfig, *promtailConfigTemplateFilePath, *promtailConfigFilePath)
	log.Printf("promtail config created and stored at: %v", *promtailConfigFilePath)
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
