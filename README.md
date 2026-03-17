# Habit Tracker Bot

[![CI/CD](https://github.com/KirshWay/habit-tracker-bot/actions/workflows/deploy.yml/badge.svg)](https://github.com/KirshWay/habit-tracker-bot/actions/workflows/deploy.yml)
![Node](https://img.shields.io/badge/node-22%2B-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-ISC-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)

> Telegram bot for habit tracking with PostgreSQL persistence and Docker-based deployment.

## Overview

This project provides a Telegram bot where users can create, list, complete, uncomplete, and delete habits.

The app is built as a single Node.js service with TypeORM + PostgreSQL and deployed through GitHub Actions to Docker Swarm.

## Features

- User onboarding via `/start`
- Create habits via `/addhabit <name>`
- Habit list with status icons via `/listhabits`
- Delete by index via `/deletehabit <number>`
- Complete/uncomplete via `/markhabit <number>` and `/unmarkhabit <number>`
- Built-in help via `/help`
- Startup migration control via `RUN_MIGRATIONS`

## Architecture

```text
habit-tracker-bot/
├── src/
│   ├── app.ts                  # bootstrap
│   ├── bot/                    # telegram commands and handlers
│   ├── services/               # user/habit business logic
│   ├── entities/               # typeorm entities
│   ├── migrations/             # db migrations
│   └── config/                 # env + datasource config
├── docker-entrypoint.sh        # optional migration run + app start
├── docker-compose.yml          # production stack (swarm)
├── compose.dev.yaml            # local postgres for development
└── .github/workflows/deploy.yml
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Bot | Telegraf |
| Runtime | Node.js 22, TypeScript |
| Database | PostgreSQL 17 |
| ORM | TypeORM 0.3.x |
| Infra | Docker, Docker Swarm, GitHub Actions |
| Package manager | pnpm |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- Docker (for local PostgreSQL)
- Telegram bot token from [@BotFather](https://t.me/BotFather)

### Installation

```bash
git clone https://github.com/KirshWay/habit-tracker-bot.git
cd habit-tracker-bot
pnpm install
```

### Configuration

Create `.env` in project root:

```env
BOT_TOKEN=your_telegram_bot_token
DB_PASS=your_postgres_password
NODE_ENV=development
```

### Development Run

```bash
docker compose -f compose.dev.yaml up -d
pnpm dev
```

## Deployment

Deployment is handled by `.github/workflows/deploy.yml` on push to `main`.

Pipeline flow:

1. Build and push application image to GHCR.
2. Deploy stack to remote Docker host over SSH.

### Required GitHub Secrets

- `BOT_TOKEN`
- `DB_PASS`
- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `BOT_TOKEN` | Yes | - | Telegram bot token |
| `DB_PASS` | Yes | - | PostgreSQL password |
| `NODE_ENV` | No | `development` | Runtime mode (`development`, `production`, `test`) |
| `DB_HOST` | No | `localhost` (dev), `postgres` (prod) | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `RUN_MIGRATIONS` | No | `true` | Run migrations on container startup |

## Security Notes

- Never commit `.env*` files with real values.
- Avoid sharing logs with resolved secrets.
- In dev, PostgreSQL is bound to `127.0.0.1:5432` (local-only access).
- App fails fast if required env vars are missing.

## Pre-push Checklist

- `pnpm build` passes.
- `sh -n docker-entrypoint.sh` passes.
- `node -e "require('./dist/config/data-source.js')"` passes.
- No secrets in git diff.

## License

[ISC](LICENSE)
