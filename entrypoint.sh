#!/bin/bash
set -e
node ./node_modules/typeorm/cli.js migration:run -d ./dist/config/data-source.js
exec "$@"
