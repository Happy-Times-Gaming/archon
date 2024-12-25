###############
#### BASE #####
###############
FROM node:22-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches

RUN apk search dumb-init
RUN apk search ca-certificates

RUN apk add --no-cache dumb-init ca-certificates
RUN corepack enable
RUN corepack install

ENTRYPOINT ["dumb-init", "--"]

###############
## PROD DEPS ##
###############
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

###############
### BUILDER ###
###############
FROM base AS builder

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

ENV NODE_ENV=production
RUN pnpm build

###############
### RUNNER ####
###############
FROM base AS runner
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/dist ./dist

CMD ["pnpm", "start"]