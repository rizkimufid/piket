# Piket — image aplikasi (dev). Build base + install deps; runtime di-handle compose.
FROM node:22-alpine

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package.json package-lock.json ./
# prisma generate (postinstall) butuh schema — salin dulu sebelum install.
COPY prisma ./prisma
RUN npm install

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
