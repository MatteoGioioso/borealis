FROM ubuntu:22.04 AS base
LABEL maintainer="Matteo Gioioso <matteo.gioioso@zalando.fi>"

ARG USER
ARG GROUP
ARG UID=1001
ARG GID=1001
ARG BOREALIS_DIR=/borealis
ARG VMAGENT_VERSION=v1.89.1
ARG EXPORT_VERSION=0.15.0
ARG PROMTAIL_VERSION=3.2.1

ENV USER=$USER
ENV GROUP=$GROUP
ENV UID=$UID
ENV GID=$GID
ENV BOREALIS_DIR=$BOREALIS_DIR
ENV VMAGENT_VERSION=$VMAGENT_VERSION
ENV EXPORT_VERSION=$EXPORT_VERSION
ENV PROMTAIL_VERSION=$PROMTAIL_VERSION

# Application variables
ENV POSTGRES_EXPORTER_CONFIG_FILE_PATH=$BOREALIS_DIR/config/postgres_exporter.yml
ENV VMAGENT_CONFIG_FILE_PATH=$BOREALIS_DIR/config/vmagent.yml

RUN DEBIAN_FRONTEND=noninteractive \
    && apt-get update && apt-get upgrade -y \
    && apt-get install -y ca-certificates runit software-properties-common wget apt-transport-https dumb-init libc6

RUN addgroup $GROUP
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "$(pwd)" \
    --ingroup "$GROUP" \
    --no-create-home \
    --uid "$UID" \
    "$USER"


FROM base AS agent

# Config
ARG CONFIG_DIR=config
COPY $CONFIG_DIR/bin/generate-config $BOREALIS_DIR/config/generate-config
COPY $CONFIG_DIR/postgesexporter-config-template.yml $BOREALIS_DIR/config/postgesexporter-config-template.yml
COPY $CONFIG_DIR/vmagent-config-template.yml $BOREALIS_DIR/config/vmagent-config-template.yml

# VictoriaMetrics agent
ARG VMAGENT_DIR=victoriametrics_agent
RUN mkdir -p $BOREALIS_DIR/vmagent \
    && wget -qO- https://github.com/VictoriaMetrics/VictoriaMetrics/releases/download/${VMAGENT_VERSION}/vmutils-linux-amd64-${VMAGENT_VERSION}.tar.gz | tar xvz -C $BOREALIS_DIR/vmagent vmagent-prod

# Postgres exporter
ARG EXPORTER_DIR=postgres_exporter
RUN mkdir -p $BOREALIS_DIR/exporter \
    && wget -qO- https://github.com/prometheus-community/postgres_exporter/releases/download/v${EXPORT_VERSION}/postgres_exporter-${EXPORT_VERSION}.linux-amd64.tar.gz | tar xvz -C $BOREALIS_DIR/exporter \
    && cp $BOREALIS_DIR/exporter/postgres_exporter-${EXPORT_VERSION}.linux-amd64/postgres_exporter $BOREALIS_DIR/exporter/postgres_exporter \
    && rm -rf $BOREALIS_DIR/exporter/postgres_exporter-${EXPORT_VERSION}.linux-amd64
COPY $EXPORTER_DIR/custom_queries.yaml $BOREALIS_DIR/exporter/custom_queries.yaml

# Postgres agent
COPY postgres_agent/bin/postgres_agent $BOREALIS_DIR/agent/postgres_agent

# Loki
RUN mkdir -p $BOREALIS_DIR/loki \
    && mkdir -p /etc/apt/keyrings/ \
    && wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor > /etc/apt/keyrings/grafana.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | tee /etc/apt/sources.list.d/grafana.list \
    && apt-get update && apt-get install -y promtail=$PROMTAIL_VERSION
RUN mv $(which promtail) $BOREALIS_DIR/loki/promtail && mkdir -p $BOREALIS_DIR/loki/tmp/loki

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

RUN chown -R $GID:$UID $BOREALIS_DIR
RUN chown -R $GID:$UID /etc/service/
RUN chmod +x -R $BOREALIS_DIR

USER $USER

WORKDIR $BOREALIS_DIR

CMD ["dumb-init", "-c", "/bin/sh", "./launch.sh"]