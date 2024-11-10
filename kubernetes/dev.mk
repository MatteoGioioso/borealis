export DOCKER_HOST=ssh://madeo@homelab
export HOSTNAME = homelab
export HOST_IP = 192.168.0.105
KIND_CLUSTER_NAME ?= homelab

setup.certs:
	cd k8s-cluster/load_balancer/ && ./create-certs.sh

setup: setup.certs kind.create kind.load

# Kind cluster
kind.create:
	cd k8s-cluster/ && ./install.sh

kind.load:
	kind load docker-image "registry.opensource.zalan.do/acid/postgres-operator:v1.13.0" --name $(KIND_CLUSTER_NAME) || (docker pull registry.opensource.zalan.do/acid/postgres-operator:v1.13.0 && kind load docker-image "registry.opensource.zalan.do/acid/postgres-operator:v1.13.0" --name $(KIND_CLUSTER_NAME))
	kind load docker-image "registry.opensource.zalan.do/acid/postgres-operator-ui:v1.13.0" --name $(KIND_CLUSTER_NAME) || (docker pull registry.opensource.zalan.do/acid/postgres-operator-ui:v1.13.0 && kind load docker-image "registry.opensource.zalan.do/acid/postgres-operator-ui:v1.13.0" --name $(KIND_CLUSTER_NAME))
	kind load docker-image "registry.opensource.zalan.do/acid/pgbouncer:master-32" --name $(KIND_CLUSTER_NAME) || (docker pull registry.opensource.zalan.do/acid/pgbouncer:master-32 && kind load docker-image "registry.opensource.zalan.do/acid/pgbouncer:master-32" --name $(KIND_CLUSTER_NAME))
	kind load docker-image "ghcr.io/zalando/spilo-16:3.3-p2" --name $(KIND_CLUSTER_NAME) || (docker pull ghcr.io/zalando/spilo-16:3.3-p2 && kind load docker-image "ghcr.io/zalando/spilo-16:3.3-p2" --name $(KIND_CLUSTER_NAME))
	kind load docker-image "chrislusf/seaweedfs" --name $(KIND_CLUSTER_NAME) || (docker pull chrislusf/seaweedfs && kind load docker-image "chrislusf/seaweedfs" --name $(KIND_CLUSTER_NAME))
	kind load docker-image "postgres:16" --name $(KIND_CLUSTER_NAME) || (docker pull postgres:16 && kind load docker-image "postgres:16" --name $(KIND_CLUSTER_NAME))

kind.use:
	kubectl config use-context kind-$(KIND_CLUSTER_NAME)
kind.delete: export DOCKER_HOST=ssh://madeo@homelab
kind.delete:
	kind delete cluster --name $(KIND_CLUSTER_NAME)
	docker stop loadbalancer && docker rm loadbalancer
kind.reset: kind.delete kind.create

pgbench: kind.use
	kubectl apply -f k8s-cluster/pgbench/deployment.yaml

# This command install certs into spilo image
install-cert:
	kubectl cp k8s-cluster/load_balancer/cert.pem borealis-example-0:/usr/local/share/ca-certificates/server.crt -c postgres
	kubectl exec --stdin --tty borealis-example-0  -- /bin/bash -c "update-ca-certificates"