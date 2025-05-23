FROM node:22-alpine AS base

RUN npm i --global --no-update-notifier --no-fund pnpm

FROM base AS dev-dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM base AS build

WORKDIR /app

COPY . .
COPY --from=dev-dependencies /app/node_modules ./node_modules

RUN pnpm build

FROM base AS dependencies

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --production

FROM base

WORKDIR /app

COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node docker-entrypoint.sh ./

RUN chmod +x docker-entrypoint.sh

USER node

ENV NODE_ENV=production

ENTRYPOINT ["sh", "./docker-entrypoint.sh"]

CMD ["pnpm", "start"]
