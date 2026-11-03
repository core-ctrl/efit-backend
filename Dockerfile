FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose backend port
EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

# Start server
CMD ["node", "server.js"]
