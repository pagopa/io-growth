FROM nginx:1.27-alpine

RUN apk add --no-cache ca-certificates

# Write INPS mTLS cert/key/CA from environment variables to files on startup.
COPY entrypoint.sh /docker-entrypoint.d/10-write-inps-certs.sh
RUN chmod +x /docker-entrypoint.d/10-write-inps-certs.sh

# The official nginx image processes files in /etc/nginx/templates/*.template
# via envsubst before starting, writing results to /etc/nginx/conf.d/*.conf.
# This replaces the default /etc/nginx/conf.d/default.conf.
COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080
