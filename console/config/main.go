package main

import (
	"github.com/borealis/commons/constants"
	"gopkg.in/alecthomas/kingpin.v2"
	"html/template"

	"log"
	"os"
)

var (
	borealisDir = kingpin.Flag("borealis-dir", "").
			Envar("BOREALIS_DIR").
			Default("/borealis").
			String()
	domainName = kingpin.Flag("domain-name", "").
			Envar("DOMAIN_NAME").
			Default("localhost").
			String()
	frontendBackendOrigin = kingpin.Flag("frontend-backend-origin", "").
				Envar("FRONTEND_BACKEND_ORIGIN").
				Default("http://localhost:8082").
				String()
	dashboardsHomePath = kingpin.Flag("dashboards-home-path", "").
				Envar("DASHBOARDS_HOME_PATH").
				Default("/var/lib/grafana/dashboards/Home/borealis-home.json").
				String()
	authStrategy = kingpin.Flag("auth-type", "").
			Envar("AUTH_TYPE").
			Default("oauth2").
			String()

	// Datasources
	prometheusHost = kingpin.Flag("prometheus-host", "").
			Envar("PROMETHEUS_HOST").
			Default("localhost").
			String()
	prometheusPort = kingpin.Flag("prometheus-port", "").
			Envar("PROMETHEUS_PORT").
			Default(constants.VictoriaMetricsPort).
			String()
	clickhouseHost = kingpin.Flag("clickhouse-host", "").
			Envar("CLICKHOUSE_HOST").
			Default("localhost").
			String()
	clickhousePort = kingpin.Flag("clickhouse-port", "").
			Envar("CLICKHOUSE_PORT").
			Default("9000").
			String()
	lokiHost = kingpin.Flag("loki-host", "").
			Envar("LOKI_HOST").
			Required().
			String()
	lokiPort = kingpin.Flag("loki-port", "").
			Envar("LOKI_PORT").
			Default("3100").
			String()

	grafanaConfigFilePath = kingpin.Flag("grafana-config-file-path", "").
				Envar("GRAFANA_CONFIG_FILE_PATH").
				Default("/etc/grafana/grafana.ini").
				String()

	grafanaDatasourcesFilePath = kingpin.Flag("grafana-datasources-file-path", "").
					Envar("GRAFANA_DATASOURCES_FILE_PATH").
					Default("/etc/grafana/provisioning/datasources/datasource.yml").
					String()

	nginxConfigFilePath = kingpin.Flag("nginx-config-file-path", "").
				Envar("NGINX_CONFIG_FILE_PATH").
				Default("/borealis/config/nginx.conf").
				String()

	reactRuntimeEnvVarsFilePath = kingpin.Flag("react-runtime-envvars-file-path", "").
					Envar("REACT_RUNTIME_ENVVARS_FILE_PATH").
					Default("/borealis/frontend/build/env-config.js").
					String()
)

var (
	reactRuntimeEnvVarsTemplateFilePath = "/borealis/config/env-template.js"
	grafanaConfigTemplateFilePath       = "/borealis/config/grafana-template.ini"
	grafanaDatasourcesTemplateFilePath  = "/borealis/config/datasource-template.yml"
	nginxConfigTemplateFilePath         = "/borealis/config/nginx_template.conf"
)

type NginxConfig struct {
	BorealisDir string
	DomainName  string
}

type ReactRuntimeEnvVars struct {
	AppMode       string
	BackendOrigin string
}

type GrafanaConfig struct {
	RootUrlPath        string
	DashboardsHomePath string
	AuthStrategy       string
}

type DatasourcesConfig struct {
	PrometheusHost          string
	PrometheusPort          string
	ClickhouseHost          string
	ClickhousePort          string
	ClickhouseTlsSkipVerify bool
	LokiHost                string
	LokiPort                string
}

func main() {
	kingpin.Parse()

	nginxConfig := NginxConfig{
		BorealisDir: *borealisDir,
		DomainName:  *domainName,
	}

	log.Printf("nginx config: %v", nginxConfigTemplateFilePath)
	GenerateFile(nginxConfig, nginxConfigTemplateFilePath, *nginxConfigFilePath)
	log.Printf("nginx config created and stored at: %v", *nginxConfigFilePath)

	reactRuntimeEnvVars := ReactRuntimeEnvVars{
		AppMode:       "self-hosted",
		BackendOrigin: *frontendBackendOrigin,
	}

	GenerateFile(reactRuntimeEnvVars, reactRuntimeEnvVarsTemplateFilePath, *reactRuntimeEnvVarsFilePath)
	log.Printf("react runtime environmental variables created and stored at: %v", *reactRuntimeEnvVarsFilePath)

	grafanaConfig := GrafanaConfig{
		RootUrlPath:        *borealisDir,
		DashboardsHomePath: *dashboardsHomePath,
		AuthStrategy:       *authStrategy,
	}

	GenerateFile(grafanaConfig, grafanaConfigTemplateFilePath, *grafanaConfigFilePath)
	log.Printf("grafana config created and stored at: %v", *grafanaConfigFilePath)

	datasourcesConfig := DatasourcesConfig{
		PrometheusHost:          *prometheusHost,
		PrometheusPort:          *prometheusPort,
		ClickhouseHost:          *clickhouseHost,
		ClickhousePort:          *clickhousePort,
		ClickhouseTlsSkipVerify: false,
		LokiHost:                *lokiHost,
		LokiPort:                *lokiPort,
	}

	GenerateFile(datasourcesConfig, grafanaDatasourcesTemplateFilePath, *grafanaDatasourcesFilePath)
	log.Printf("grafana datasources provisioning created and stored at: %v", *grafanaDatasourcesFilePath)
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
