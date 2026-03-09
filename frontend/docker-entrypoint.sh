#!/bin/sh
set -e

# Substitui a variável de ambiente no nginx.conf
if [ -n "$API_URL" ]; then
    sed -i "s|\${API_URL}|$API_URL|g" /etc/nginx/conf.d/default.conf
fi

exec nginx -g 'daemon off;'
