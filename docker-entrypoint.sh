#!/bin/sh

set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running migrations..."
  pnpm migration:run
else
  echo "Skipping migrations (RUN_MIGRATIONS=${RUN_MIGRATIONS:-false})"
fi

exec "$@"
