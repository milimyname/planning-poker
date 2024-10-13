# Stage 1: Build the application
FROM node:lts-alpine as builder

ENV NODE_ENV=development

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-lock.yaml* ./

# Install npm packages
RUN pnpm i

COPY . .

ENV NODE_ENV=production

# Build arguments for secrets
ARG VITE_ELECTRIC_URL
ARG DATABASE_URL

RUN --mount=type=secret,id=VITE_ELECTRIC_URL \
    export VITE_ELECTRIC_URL="$(cat /run/secrets/VITE_ELECTRIC_URL)" && \
    export DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" && \
    pnpm drizzle-kit generate && \
    pnpm run build

# Remove dev dependencies
RUN pnpm prune --prod

# Stage 2: Create the production image
FROM node:lts-alpine

WORKDIR /app

# Copy the built files from the previous stage
COPY --from=builder /app .

ENV PORT=3000
ENV NODE_ENV=production
ENV VITE_ELECTRIC_URL=${VITE_ELECTRIC_URL}
ENV DATABASE_URL=${DATABASE_URL}

CMD ["node", "./build"]