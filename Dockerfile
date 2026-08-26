# Nest API → Cloud Run
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web-admin/package.json apps/web-admin/package.json
COPY apps/web-onboarding/package.json apps/web-onboarding/package.json
COPY e2e/package.json e2e/package.json
RUN npm ci

FROM deps AS build
WORKDIR /app
COPY apps/api apps/api
COPY packages/shared packages/shared
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
EXPOSE 8080
ENV PORT=8080
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
