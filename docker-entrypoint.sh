#!/bin/bash

set -e

pnpm migration:run

exec "$@"
