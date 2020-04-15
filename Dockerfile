FROM node:12-alpine

WORKDIR /app
CMD ["node", "dist/main"]

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
