#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_FILE="${BACKUP_DIR}/main-$(date +%Y%m%d-%H%M%S).sql.gz"

mkdir -p "${BACKUP_DIR}"
docker compose exec -T mysql sh -c \
  'exec mysqldump --single-transaction --quick --routines --triggers -u root -p"$MYSQL_ROOT_PASSWORD" main' \
  | gzip > "${BACKUP_FILE}"

echo "Backup created: ${BACKUP_FILE}"
