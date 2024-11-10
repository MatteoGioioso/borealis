#!/usr/bin/env sh

$BOREALIS_DIR/config/generate-config &&

sv_stop() {
  sv -w 30 stop /etc/service/*
}

trap sv_stop TERM QUIT INT

runsvdir -P /etc/service &

wait