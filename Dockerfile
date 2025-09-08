# Dockerfile for Ulimi Web Application
# Optimized for ESM/CommonJS compatibility and production deployment

FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --omit=dev

# Copy source code
COPY . .

# Build application
RUN chmod +x deploy.sh
RUN ./deploy.sh

# Production image
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy package.json for dependency info
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ulimi -u 1001

# Change ownership of app directory
RUN chown -R ulimi:nodejs /app
USER ulimi

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start application
CMD ["node", "dist/index.js"]