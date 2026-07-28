#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/compose.yaml"
ENV_FILE="${ENV_FILE:-${SCRIPT_DIR}/.env}"
BACKUP_DIR="${BACKUP_DIR:-${SCRIPT_DIR}/backups}"
BACKUP_FILE="${BACKUP_DIR}/main-$(date +%Y%m%d-%H%M%S).sql.gz"

mkdir -p "${BACKUP_DIR}"
# 使用腳本所在位置的 Compose 與環境檔，部署人員可從任意工作目錄安全執行備份。
docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T mysql sh -c \
  'exec mysqldump --single-transaction --quick --routines --triggers -u root -p"$MYSQL_ROOT_PASSWORD" main' \
  | gzip > "${BACKUP_FILE}"

echo "Backup created: ${BACKUP_FILE}"
