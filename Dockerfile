FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN rm -rf dist && npx vite build && npx esbuild server/index.ts --bundle --platform=node --outdir=dist/server --format=esm --packages=external
EXPOSE 3000
CMD ["npm", "start"]
