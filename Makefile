BIN_DIR = bin
GOMODFILE ?= go.mod
PROTO_DIR = proto
FRONTEND_DIR = console/frontend/src/components/SelfHosted/proto
PACKAGE = $(cd proto/ && shell head -1 go.mod | awk '{print $$2}')
GO = $(HOME)/go/bin/go1.18.10
BUILDKIT_PROGRESS=plain
export DOCKER_HOST=ssh://madeo@homelab

reload.agent: build.agent
	docker-compose up --build --remove-orphans agent -d

gen.sanitize:
	curl -o backend/shared/sanitize.go https://raw.githubusercontent.com/jackc/pgx/master/internal/sanitize/sanitize.go
	sed -i 's/package sanitize/package shared/' backend/shared/sanitize.go

gen.proto:
	protoc -I${PROTO_DIR} --go_opt=module=${PACKAGE} --go_out=. --go-grpc_opt=module=${PACKAGE} --go-grpc_out=. ${PROTO_DIR}/*.proto
	protoc -I${PROTO_DIR} --grpc-gateway_out ${PROTO_DIR} \
        --grpc-gateway_opt logtostderr=true \
        --grpc-gateway_opt paths=source_relative \
        ${PROTO_DIR}/*.proto
	protoc \
		--grpc-gateway-ts_out=loglevel=debug,use_proto_names=true:${FRONTEND_DIR} \
		--proto_path=${PROTO_DIR} ${PROTO_DIR}/info.proto ${PROTO_DIR}/analytics.proto ${PROTO_DIR}/activities.proto ${PROTO_DIR}/shared.proto

build.agent:
	(cd agent/postgres_agent/ && go mod tidy -modfile=$(GOMODFILE) && GOOS=linux GOARCH=amd64 go build -modfile=$(GOMODFILE) -o bin/postgres_agent .)
	(cd agent/config && go mod tidy -modfile=$(GOMODFILE) && GOOS=linux GOARCH=amd64 go build -modfile=$(GOMODFILE) -o bin/generate-config .)

build.backend:
	(cd console/backend && go mod tidy -modfile=$(GOMODFILE) && GOOS=linux GOARCH=amd64 go build -modfile=$(GOMODFILE) -o bin/backend .)
	(cd console/config && go mod tidy -modfile=$(GOMODFILE) && GOOS=linux GOARCH=amd64 go build -modfile=$(GOMODFILE) -o bin/generate-config .)

build.frontend:
	(cd console/frontend && npm run build)

build.console: build.frontend build.backend

run.frontend:
	(cd console/frontend && REACT_APP_MODE=self_hosted REACT_APP_BACKEND_ORIGIN=http://localhost:8082 npm run start)

run.headless: build.backend build.agent
	docker-compose up --build --remove-orphans

run:
	docker-compose up --build --remove-orphans

build_and_run: build.console build.agent run

down:
	docker-compose down --remove-orphans