#!/usr/bin/env sh

if [ "$GRAFANA_DISABLED" = "1" ]; then
echo "grafana disabled"
  rm /etc/service/grafana
fi

if [ "$CONSOLE_DISABLED" = "1" ]; then
echo "console disabled"
  rm /etc/service/backend
  rm /etc/service/frontend
fi

if [ "$NGINX_DISABLED" = "1" ]; then
echo "nginx proxy disabled"
  rm /etc/service/nginx
fi

$BOREALIS_DIR/config/generate-config &&

sv_stop() {
  sv -w 30 stop /etc/service/*
}

trap sv_stop TERM QUIT INT

runsvdir -P /etc/service &

wait