#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 path/to/backup.sql.gz" >&2
  exit 1
fi

gzip -dc "$1" | docker compose exec -T mysql sh -c \
  'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" main'

echo "Backup restored: $1"
