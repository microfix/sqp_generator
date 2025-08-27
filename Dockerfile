# ---- build stage ----
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# bygger klient til dist/public og server til dist/index.js
RUN npm run build

# ---- runtime stage ----
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# kopiér færdigbygget output
COPY --from=build /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/index.js"]
