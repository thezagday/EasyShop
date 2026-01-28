# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache bash

# Development stage
FROM base AS dev

CMD ["sh", "-c", "yarn install && yarn watch"]

# Builder stage for production assets
FROM base AS builder

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY webpack.config.js ./
COPY assets ./assets

RUN yarn build
