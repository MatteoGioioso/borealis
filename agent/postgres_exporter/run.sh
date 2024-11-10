#!/usr/bin/env bash

set -o errexit
set -o nounset

exec env $BOREALIS_DIR/exporter/postgres_exporter --config.file $POSTGRES_EXPORTER_CONFIG_FILE_PATH