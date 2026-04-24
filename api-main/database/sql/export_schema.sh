#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUTPUT_FILE="${ROOT_DIR}/database/sql/schema.sql"

mkdir -p "$(dirname "${OUTPUT_FILE}")"

docker compose exec -T postgres pg_dump \
  --schema-only \
  --no-owner \
  --no-privileges \
  -U "${POSTGRES_USER:-postgres}" \
  "${POSTGRES_DB:-plusdate}" > "${OUTPUT_FILE}"

echo "Schema dump written to ${OUTPUT_FILE}"
