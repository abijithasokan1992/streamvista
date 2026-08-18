FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node","server/index.mjs"]
