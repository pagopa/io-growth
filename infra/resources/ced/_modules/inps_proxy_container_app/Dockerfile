FROM nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10

RUN apk add --no-cache ca-certificates

# Write INPS mTLS cert/key/CA from environment variables to files on startup.
COPY entrypoint.sh /docker-entrypoint.d/10-write-inps-certs.sh
RUN chmod +x /docker-entrypoint.d/10-write-inps-certs.sh

# The official nginx image processes files in /etc/nginx/templates/*.template
# via envsubst before starting, writing results to /etc/nginx/conf.d/*.conf.
# This replaces the default /etc/nginx/conf.d/default.conf.
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Default: verify INPS server cert. Override with INPS_UPSTREAM_SSL_VERIFY=off
# (collaudo only, until the full INPS root CA chain is provisioned).
# Must be set here so envsubst in 20-envsubst-on-templates.sh sees it;
# the /docker-entrypoint.d/ scripts run as separate processes and cannot
# export variables to each other.
ENV INPS_UPSTREAM_SSL_VERIFY=off

EXPOSE 8080
