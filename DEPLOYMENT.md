# Ulimi Web Application - Deployment Guide

## ESM/CommonJS Compatibility Fixes

This deployment guide addresses the CommonJS/ESM module conflicts that were causing build failures during deployment.

### Issues Fixed

1. **Server build failing due to CommonJS/ESM module conflicts**
2. **Top-level await not supported in CommonJS format in vite.config.ts**
3. **Import.meta properties not available in CommonJS format causing undefined dirname values**

### Solution Implementation

#### 1. Custom Build Script (build.js)

Created a custom ESM-compatible build script that:
- Uses ESM format instead of CommonJS for esbuild output
- Adds proper ESM shims for `__dirname` and `__filename`
- Externalizes dependencies to prevent bundling conflicts
- Includes proper banner injection for Node.js globals

Key features:
```javascript
format: 'esm',                    // Use ESM instead of CommonJS
target: 'node18',                 // Target Node.js 18+
external: [                       // Prevent bundling conflicts
  'express', 'pg', 'drizzle-orm', // ... other deps
],
banner: {                         // Inject ESM shims
  js: 'import { fileURLToPath } from "url"; ...'
}
```

#### 2. Deployment Script (deploy.sh)

Automated deployment script with:
- Build verification and error handling
- Syntax validation for generated output
- Database schema setup (development)
- Environment variable documentation

#### 3. Production Docker Configuration

Multi-stage Dockerfile optimized for:
- ESM/CommonJS compatibility
- Security (non-root user)
- Health checks
- Minimal production image size

## Deployment Options

### Option 1: Replit Deployment (Recommended)

1. Use the custom build process:
```bash
chmod +x deploy.sh
./deploy.sh
```

2. Deploy using Replit's deployment feature
3. Environment variables will be handled automatically

### Option 2: Manual Deployment

1. Build the application:
```bash
npm run build:client
node build.js
```

2. Start in production:
```bash
NODE_ENV=production node dist/index.js
```

### Option 3: Docker Deployment

1. Build Docker image:
```bash
docker build -t ulimi-web .
```

2. Run container:
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL="your-db-url" \
  -e VITE_FIREBASE_API_KEY="your-key" \
  ulimi-web
```

### Option 4: Cloud Platforms

#### Vercel
- Supports ESM out of the box
- Use `vercel.json` for configuration
- Serverless functions for API routes

#### Railway
- Docker-based deployment
- Automatic environment variable injection
- Built-in PostgreSQL database

#### Heroku
- Uses `start` script from package.json
- Add `Procfile`: `web: node dist/index.js`
- Set `NODE_ENV=production`

## Environment Variables

Required for production deployment:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id  
VITE_FIREBASE_APP_ID=your-app-id

# Production Settings
NODE_ENV=production
PORT=5000
```

## Build Verification

After deployment, verify:

1. **Client Build**: Check `dist/public/` contains static files
2. **Server Build**: Verify `dist/index.js` is ESM format
3. **Syntax Check**: Run `node --check dist/index.js`
4. **Health Check**: Test `GET /health` endpoint (if implemented)

## Troubleshooting

### Common Issues

1. **"Cannot use import statement"**
   - Ensure `build.js` is using `format: 'esm'`
   - Check Node.js version is 18+

2. **"__dirname is not defined"**
   - Verify banner injection in `build.js`
   - Check ESM shims are properly included

3. **"Module not found"**
   - Add missing dependencies to `external` array
   - Check import paths in source code

### Debug Commands

```bash
# Check build output format
file dist/index.js

# Validate server syntax
node --check dist/index.js

# Test server startup (dry run)
NODE_ENV=production node --dry-run dist/index.js

# Check client assets
ls -la dist/public/
```

## Performance Optimizations

- **ESM format** reduces startup time
- **External dependencies** prevent bundle bloat
- **Multi-stage Docker** minimizes image size
- **Health checks** enable proper orchestration

## Security Considerations

- Non-root user in Docker container
- Environment variable validation
- Dependency security scanning
- HTTPS termination at load balancer level

This deployment configuration ensures compatibility across all major cloud platforms while maintaining optimal performance and security standards.