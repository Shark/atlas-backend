FROM node:18-alpine AS builder
RUN mkdir /app
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY ./ ./
RUN npm run compile

FROM node:18-alpine AS runtime
RUN mkdir /app
WORKDIR /app
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm install --omit=dev
COPY --from=builder /app/.build/ ./
CMD ["/app/server.js"]
