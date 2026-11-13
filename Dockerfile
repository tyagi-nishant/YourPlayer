# Build & Runtime stage for AWS App Runner / ECS / Elastic Beanstalk / Lightsail
FROM node:22-alpine

WORKDIR /app

# Copy package manifests
COPY package.json ./

# Install dependencies
RUN npm install

# Copy project source
COPY . .

# Build Vite frontend assets into /app/dist
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run full-stack Express + static SPA server
CMD ["npx", "tsx", "server.ts"]
