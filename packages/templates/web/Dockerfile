# syntax=docker/dockerfile:1.4
FROM node:18-alpine as base
WORKDIR /website
COPY package*.json ./
RUN npm ci


FROM base AS dev
COPY . .
CMD ["npm", "run", "dev"]
