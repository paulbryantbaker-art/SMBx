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
# Force a real rebuild of the client + server on EVERY deploy. The old static
# `ARG CACHEBUST=1` never changed, so Railway's Docker layer cache kept reusing
# a stale `vite build` output — production shipped a pre-redesign frontend even
# though origin/main had the new code. Railway injects RAILWAY_GIT_COMMIT_SHA at
# build time; a changing ARG value here busts this layer's cache every commit.
ARG RAILWAY_GIT_COMMIT_SHA=local
RUN rm -rf dist \
  && echo "Building client+server for commit ${RAILWAY_GIT_COMMIT_SHA}" \
  && npx vite build \
  && npx esbuild server/index.ts --bundle --platform=node --outdir=dist/server --format=esm --packages=external \
  && mkdir -p dist/server/migrations \
  && cp server/migrations/*.sql dist/server/migrations/
EXPOSE 3000
CMD ["npm", "start"]
