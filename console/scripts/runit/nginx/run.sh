#!/usr/bin/env sh

set -o errexit
set -o nounset

nginx -t -v -c $NGINX_CONFIG_FILE_PATH

echo "** Starting NGINX**"
exec env nginx -c "$NGINX_CONFIG_FILE_PATH" -g "daemon off;"