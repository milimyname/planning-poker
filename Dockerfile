FROM node:lts-alpine as builder

ENV NODE_ENV=development

RUN npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-lock.yaml* ./

RUN pnpm i

COPY . .

ENV NODE_ENV=production

# Build arguments for secrets
ARG PUBLIC_ELECTRIC_URL
ARG DATABASE_URL

# Set build-time environment variables for the build process
ENV PUBLIC_ELECTRIC_URL=${PUBLIC_ELECTRIC_URL}
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm build

# Remove dev dependencies
RUN pnpm prune --prod

# Stage 2: Create the production image
FROM node:lts-alpine

WORKDIR /app

# Copy the built files from the previous stage
COPY --from=builder /app .

ENV PORT=4000
ENV NODE_ENV=production

CMD ["node", "./build"]