#!/usr/bin/env sh

set -o errexit
set -o nounset

exec $BOREALIS_DIR/vmagent/vmagent-prod \
  --promscrape.config=$VMAGENT_CONFIG_FILE_PATH \
  --remoteWrite.url=http://"${VICTORIAMETRICS_HOST}":"${VICTORIAMETRICS_PORT}"/api/v1/write