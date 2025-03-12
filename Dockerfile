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

RUN pnpm generate && pnpm build

# Remove dev dependencies
RUN pnpm prune --prod

# Stage 2: Create the production image
FROM node:lts-alpine

WORKDIR /app

# Copy the built files from the previous stage
COPY --from=builder /app .

ENV PORT=4000
ENV NODE_ENV=production
ENV VITE_ELECTRIC_URL=${VITE_ELECTRIC_URL}
ENV DATABASE_URL=${DATABASE_URL}

CMD ["node", "./build"]