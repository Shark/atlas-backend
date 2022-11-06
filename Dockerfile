FROM node:18-alpine
RUN mkdir /app
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm install
COPY .build/ /app/
CMD ["server.js"]
