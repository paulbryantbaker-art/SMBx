FROM node:22-alpine

# Chromium for Puppeteer PDF rendering (charts render via Chart.js CDN in-page)
RUN apk add --no-cache \
  chromium nss freetype harfbuzz ca-certificates ttf-freefont \
  font-noto font-noto-cjk

# Tell puppeteer to use system Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG CACHEBUST=1
RUN rm -rf dist && npx vite build && npx esbuild server/index.ts --bundle --platform=node --outdir=dist/server --format=esm --packages=external
EXPOSE 3000
CMD ["npm", "start"]
