#!/usr/bin/env sh

if [ "$AGENT_DISABLED" = "1" ]; then
  echo "agent disabled"
  rm /etc/service/agent
fi

if [ "$EXPORTER_DISABLED" = "1" ]; then
echo "exporter disabled"
  rm /etc/service/exporter
fi

if [ "$VMAGENT_DISABLED" = "1" ]; then
echo "vmagent disabled"
  rm /etc/service/vmagent
fi

if [ "$PROMTAIL_DISABLED" = "1" ]; then
echo "promtail disabled"
  rm /etc/service/promtail
fi

$BOREALIS_DIR/config/generate-config &&

sv_stop() {
  sv -w 30 stop /etc/service/*
}

trap sv_stop TERM QUIT INT

runsvdir -P /etc/service &

wait