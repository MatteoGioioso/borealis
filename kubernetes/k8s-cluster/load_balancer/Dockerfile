FROM haproxy:2.6.4-alpine3.16

ARG HOSTNAME=$HOSTNAME

COPY ./haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
COPY ./$HOSTNAME/main.pem /etc/ssl/certs/cert.pem