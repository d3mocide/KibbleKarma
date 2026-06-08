# Backend Dockerfile for Nibbles & Naps API
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies (including dev deps for build + prisma generate)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

# Build TypeScript and generate Prisma client
FROM deps AS build
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist

EXPOSE 4000
# Run migrations then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
