#!/bin/sh
# Write INPS mTLS credentials from environment variables to files consumed by nginx.
# This script is executed at container startup via the nginx /docker-entrypoint.d/ mechanism.
set -eu

mkdir -p /etc/ssl/inps
printf '%s' "${INPS_CLIENT_CERT}" > /etc/ssl/inps/client.crt
printf '%s' "${INPS_CLIENT_KEY}"  > /etc/ssl/inps/client.key
printf '%s' "${INPS_CLIENT_CA}"   > /etc/ssl/inps/ca.crt
chmod 600 /etc/ssl/inps/client.key

# Default: verify INPS server cert. Set INPS_UPSTREAM_SSL_VERIFY=off to skip
# verification (collaudo only, until the full INPS root CA chain is provisioned).
export INPS_UPSTREAM_SSL_VERIFY="${INPS_UPSTREAM_SSL_VERIFY:-on}"
