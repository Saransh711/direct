FROM node:22-alpine AS base
WORKDIR /app
ARG DATABASE_URL=postgresql://postgres:postgres@localhost:5432/loan_db?schema=public
ENV DATABASE_URL=$DATABASE_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run prisma:generate && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/prisma.config.ts ./prisma.config.ts
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:deploy && npm run prisma:seed && node dist/server.js"]