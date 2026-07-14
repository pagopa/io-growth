#!/bin/sh
# Write INPS mTLS credentials from environment variables to files consumed by nginx.
# This script is executed at container startup via the nginx /docker-entrypoint.d/ mechanism.
set -eu

mkdir -p /etc/ssl/inps
printf '%s' "${INPS_CLIENT_CERT}" > /etc/ssl/inps/client.crt
printf '%s' "${INPS_CLIENT_KEY}"  > /etc/ssl/inps/client.key
printf '%s' "${INPS_CLIENT_CA}"   > /etc/ssl/inps/ca.crt
chmod 600 /etc/ssl/inps/client.key
