package main

import (
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

	nginxConfigFilePath = kingpin.Flag("nginx-config-file-path", "").
				Envar("NGINX_CONFIG_FILE_PATH").
				Default("/borealis/nginx.conf").
				String()
	nginxConfigTemplateFilePath = kingpin.Flag("nginx-config-template-file-path", "").
					Envar("NGINX_CONFIG_TEMPLATE_FILE_PATH").
					Default("nginx_template.conf").
					String()

	reactRuntimeEnvVarsFilePath = kingpin.Flag("react-runtime-envvars-file-path", "").
					Envar("REACT_RUNTIME_ENVVARS_FILE_PATH").
					Default("/borealis/frontend/build/env-config.js").
					String()
	reactRuntimeEnvVarsTemplateFilePath = kingpin.Flag("react-runtime-envvars-template-file-path", "").
						Envar("REACT_RUNTIME_ENVVARS_TEMPLATE_FILE_PATH").
						Default("/borealis/frontend/env-template.js").
						String()
)

type NginxConfig struct {
	BorealisDir string
	DomainName  string
}

type ReactRuntimeEnvVars struct {
	AppMode       string
	BackendOrigin string
}

func main() {
	kingpin.Parse()

	nginxConfig := NginxConfig{
		BorealisDir: *borealisDir,
		DomainName:  *domainName,
	}

	GenerateFile(nginxConfig, *nginxConfigTemplateFilePath, *nginxConfigFilePath)
	log.Printf("nginx config created and stored at: %v", *nginxConfigFilePath)

	reactRuntimeEnvVars := ReactRuntimeEnvVars{
		AppMode:       "self-hosted",
		BackendOrigin: *frontendBackendOrigin,
	}

	GenerateFile(reactRuntimeEnvVars, *reactRuntimeEnvVarsTemplateFilePath, *reactRuntimeEnvVarsFilePath)
	log.Printf("react runtime environmental variables created and stored at: %v", *reactRuntimeEnvVarsFilePath)
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
