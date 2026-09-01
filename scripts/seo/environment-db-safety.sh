#!/usr/bin/env bash
set -euo pipefail

# StreamVista AI SEO Metadata safety wrapper.
# This wrapper intentionally blocks ambiguous or accidental database writes.
# It does not print secrets and does not choose a database provider/tool.

: "${APP_ENV:?APP_ENV is required}"
: "${DATABASE_URL:?DATABASE_URL is required}"

case "$APP_ENV" in
  development|test|preview|production) ;;
  *)
    echo "ERROR: Unsupported APP_ENV=$APP_ENV" >&2
    exit 1
    ;;
esac

# Never print DATABASE_URL. Only expose non-secret connection identity.
DB_PROTOCOL="$(node -e 'const u=new URL(process.env.DATABASE_URL); process.stdout.write(u.protocol)' 2>/dev/null)"
DB_HOST="$(node -e 'const u=new URL(process.env.DATABASE_URL); process.stdout.write(u.hostname)' 2>/dev/null)"
DB_NAME="$(node -e 'const u=new URL(process.env.DATABASE_URL); process.stdout.write(u.pathname.replace(/^\//, ""))' 2>/dev/null)"

printf 'Environment: %s\n' "$APP_ENV"
printf 'Database protocol: %s\n' "$DB_PROTOCOL"
printf 'Database host: %s\n' "$DB_HOST"
printf 'Database name: %s\n' "$DB_NAME"

if [[ "$APP_ENV" == "production" ]]; then
  [[ "${ALLOW_PRODUCTION_SEO_BACKFILL:-}" == "YES" ]] || {
    echo "ERROR: Production SEO backfill is blocked." >&2
    echo "Set ALLOW_PRODUCTION_SEO_BACKFILL=YES only after release gates and recovery readiness are confirmed." >&2
    exit 1
  }
fi

DRY_RUN="${DRY_RUN:-true}"
case "$DRY_RUN" in
  true|false) ;;
  *)
    echo "ERROR: DRY_RUN must be true or false." >&2
    exit 1
    ;;
esac

LIMIT="${LIMIT:-10}"
[[ "$LIMIT" =~ ^[0-9]+$ ]] || {
  echo "ERROR: LIMIT must be a non-negative integer." >&2
  exit 1
}

if [[ "$APP_ENV" == "production" && "$LIMIT" -gt "${MAX_PRODUCTION_BATCH:-25}" ]]; then
  echo "ERROR: Production batch exceeds MAX_PRODUCTION_BATCH=${MAX_PRODUCTION_BATCH:-25}." >&2
  exit 1
fi

if [[ "$DRY_RUN" == "false" && "${RECOVERY_CONFIRMED:-NO}" != "YES" ]]; then
  echo "ERROR: RECOVERY_CONFIRMED=YES is required for write mode." >&2
  exit 1
fi

if [[ "$DRY_RUN" == "false" && "${ROLLBACK_TARGET_CONFIRMED:-NO}" != "YES" ]]; then
  echo "ERROR: ROLLBACK_TARGET_CONFIRMED=YES is required for write mode." >&2
  exit 1
fi

printf 'Dry run: %s\n' "$DRY_RUN"
printf 'Batch limit: %s\n' "$LIMIT"
printf 'Safety checks: PASS\n'

# Usage: source this wrapper from the actual backfill command, then execute
# the repository's existing migration/backfill tool. This file deliberately
# does not invent database-specific commands.
