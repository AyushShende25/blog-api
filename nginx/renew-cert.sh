#!/bin/bash
set -euo pipefail

cd /opt/inkspire/blog-api

docker compose run --rm certbot renew -q && docker compose exec nginx nginx -s reload