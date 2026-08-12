FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/data/streamvista.sqlite
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
RUN mkdir -p /data && chown -R node:node /app /data
USER node
EXPOSE 3000
CMD ["node","server/index.mjs"]
