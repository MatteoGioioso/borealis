FROM ubuntu:22.04 AS base
LABEL maintainer="Matteo Gioioso <matteo.gioioso@zalando.fi>"

ARG USER
ARG GROUP
ARG UID=1001
ARG GID=1001
ARG BOREALIS_DIR=/borealis
ARG GRAFANA_VERSION=8.5.21
ARG NGINX_VERSION=1.23.3-1~focal
ARG DEX_VERSION=v2.37.x

ENV GIN_MODE=release
ENV USER=$USER
ENV GROUP=$GROUP
ENV UID=$UID
ENV GID=$GID
ENV BOREALIS_DIR=$BOREALIS_DIR
ENV GRAFANA_VERSION=$GRAFANA_VERSION
ENV NGINX_VERSION=$NGINX_VERSION
ENV DEX_VERSION=$DEX_VERSION

# Config
ENV NGINX_CONFIG_FILE_PATH=$BOREALIS_DIR/config/nginx.conf \
    PATH="/usr/share/grafana/bin:$PATH" \
    GF_PATHS_CONFIG="/etc/grafana/grafana.ini" \
    GF_PATHS_DATA="/var/lib/grafana" \
    GF_PATHS_HOME="/usr/share/grafana" \
    GF_PATHS_LOGS="/var/log/grafana" \
    GF_PATHS_PLUGINS="/var/lib/grafana/plugins" \
    GF_PATHS_PROVISIONING="/etc/grafana/provisioning"

RUN DEBIAN_FRONTEND=noninteractive \
    && apt-get update && apt-get upgrade -y \
    && apt-get install -y ca-certificates runit software-properties-common wget apt-transport-https dumb-init

RUN addgroup $GROUP
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "$(pwd)" \
    --ingroup "$GROUP" \
    --no-create-home \
    --uid "$UID" \
    "$USER"

FROM base AS backend

COPY backend/migrations $BOREALIS_DIR/backend/migrations
COPY backend/services/activities/wait_events.json $BOREALIS_DIR/backend/wait_events.json
ADD backend/bin/backend $BOREALIS_DIR/backend/backend

FROM backend AS frontend

# nginx
RUN DEBIAN_FRONTEND=noninteractive  \
    && wget -q -O - https://nginx.org/keys/nginx_signing.key | gpg --dearmor | tee /usr/share/keyrings/nginx-archive-keyring.gpg >/dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/nginx-archive-keyring.gpg] http://nginx.org/packages/mainline/ubuntu `lsb_release -cs` nginx" | tee /etc/apt/sources.list.d/nginx.list \
    && apt-get update \
    && apt-get install -y nginx=$NGINX_VERSION

RUN mkdir -p $BOREALIS_DIR/nginx/tmp $BOREALIS_DIR/nginx/logs && chmod 777 -R /var/log/nginx

COPY frontend/build $BOREALIS_DIR/frontend/build
COPY proxy/proxy.sh $BOREALIS_DIR/frontend/proxy.sh

# grafana
RUN DEBIAN_FRONTEND=noninteractive \
    && wget -q -O /usr/share/keyrings/grafana.key https://apt.grafana.com/gpg.key \
    && echo "deb [signed-by=/usr/share/keyrings/grafana.key] https://apt.grafana.com stable main" | tee -a /etc/apt/sources.list.d/grafana.list \
    && apt-get update \
    && apt-get install -y grafana=$GRAFANA_VERSION

ARG GRAFANA_DIR=./grafana

RUN mkdir -p "$GF_PATHS_PROVISIONING/datasources" \
             "$GF_PATHS_PROVISIONING/dashboards" \
             "$GF_PATHS_PROVISIONING/notifiers" \
             "$GF_PATHS_PROVISIONING/plugins" \
             "$GF_PATHS_PROVISIONING/access-control" \
             "$GF_PATHS_PROVISIONING/alerting" \
             "$GF_PATHS_LOGS" \
             "$GF_PATHS_PLUGINS" \
             "$GF_PATHS_DATA" && \
  chown -R "$GID:$UID" "$GF_PATHS_DATA" "$GF_PATHS_HOME" /etc/grafana "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" && \
  chmod -R 777 "$GF_PATHS_DATA" "$GF_PATHS_HOME" /etc/grafana "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING"

ADD $GRAFANA_DIR/provisioning/plugins/ $GF_PATHS_PROVISIONING/plugins/
ADD $GRAFANA_DIR/provisioning/ $GF_PATHS_PROVISIONING/
ADD $GRAFANA_DIR/dashboards/ $GF_PATHS_DATA/dashboards/

FROM frontend AS console

# config
ARG CONFIG_DIR=./config
COPY $CONFIG_DIR/templates $BOREALIS_DIR/config
COPY $CONFIG_DIR/bin/generate-config $BOREALIS_DIR/config/generate-config

# runit
COPY scripts/launch.sh $BOREALIS_DIR/launch.sh
COPY scripts/runit $BOREALIS_DIR/services/
RUN for d in $BOREALIS_DIR/services/*; do \
        chmod 755 $d/* \
        && ln -s $BOREALIS_DIR/services/$(basename $d) /etc/service/; \
    done

# Clean up
RUN apt-get autoremove --purge && apt-get clean && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Fix permissions
RUN chown -R $GID:$UID $BOREALIS_DIR
RUN chown -R $GID:$UID /etc/service/
RUN chmod +x -R $BOREALIS_DIR

USER $USER

WORKDIR $BOREALIS_DIR

EXPOSE 8082
EXPOSE 3000

CMD ["dumb-init", "-c", "/bin/sh", "./launch.sh"]