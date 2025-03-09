# Habit Tracker Bot

A Telegram bot for tracking daily habits built with modern technologies.

## 💽 Technologies Used

- **Bot Framework:** Telegraf
- **Database:** PostgreSQL (managed with TypeORM)
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions for automated build and deployment

## 📦 Quick Setup

1. **Clone the Repository:**

```bash
git clone https://github.com/yourusername/habit-tracker-bot.git
cd habit-tracker-bot
```

2. **Install Dependencies:**

```bash
pnpm install
```

2. **Run Locally Using Docker Compose for development database:**

```bash
docker compose -f compose.dev.yaml up --build -d
```
