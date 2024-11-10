#!/usr/bin/env sh

minica --domains $HOSTNAME --ca-cert cert.pem --ca-key key.pem
(cd $HOSTNAME && cat cert.pem key.pem > main.pem && chmod 777 main.pem)