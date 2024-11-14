package main

import (
	"github.com/borealis/agent/config/pkg"
	"gopkg.in/alecthomas/kingpin.v2"
	"log"
	"os"
	"text/template"
)

var (
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
