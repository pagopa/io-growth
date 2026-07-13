FROM nginx:1.27-alpine

RUN apk add --no-cache ca-certificates

# The official nginx image processes files in /etc/nginx/templates/*.template
# via envsubst before starting, writing results to /etc/nginx/conf.d/*.conf.
# This replaces the default /etc/nginx/conf.d/default.conf.
COPY default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 8080
