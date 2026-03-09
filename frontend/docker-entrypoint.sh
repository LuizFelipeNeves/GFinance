#!/bin/sh
set -e

echo "API_URL: $API_URL"

# Substitui a variável de ambiente no nginx.conf
if [ -n "$API_URL" ]; then
    sed -i "s|\${API_URL}|$API_URL|g" /etc/nginx/conf.d/default.conf
    echo "Nginx config updated"
else
    echo "WARNING: API_URL is not set!"
fi

exec nginx -g 'daemon off;'
