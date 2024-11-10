#!/usr/bin/env sh

set -e

kind create cluster --name homelab --config=cluster.yaml

kubectl config use-context kind-homelab &&

# Install nginx ingress
echo "Installing nginx ingress controller"
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml &&

echo "Installing metrics server"
kubectl apply -f metrics-server.yaml &&

echo "Starting load balancer"
docker build --build-arg HOSTNAME=$HOSTNAME -t haproxy-local:latest ./load_balancer && docker run --net=host -d --name loadbalancer haproxy-local:latest