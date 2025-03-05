#!/bin/bash
set -e
pnpm typeorm migration:run -d ./src/config/data-source.ts
exec "$@"
