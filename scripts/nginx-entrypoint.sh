#!/bin/sh

(
  while :; do
    sleep 6h
    # Only reload if nginx is actually running
    if pgrep nginx > /dev/null; then
        echo "### Refreshing Nginx configuration..."
        nginx -s reload
    fi
  done
) &

echo "### Starting Nginx..."
exec /docker-entrypoint.sh nginx -g "daemon off;"
