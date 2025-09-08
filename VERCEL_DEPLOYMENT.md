# Ulimi Vercel Deployment Guide

## Overview

Your Ulimi application is now configured for deployment on Vercel with full ESM support and proper CommonJS/ESM conflict resolution.

## Quick Deploy to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to a GitHub repository
2. Connect repository to Vercel at [vercel.com](https://vercel.com)
3. Vercel will automatically deploy using the configured build process

## Build Configuration

The application uses a custom build process optimized for Vercel:

### Build Command
- `node vercel-build.js` - Custom build script for Vercel
- Builds client assets to `public/` directory
- Creates serverless function in `api/index.js`
- Bundles server code with proper ESM format

### File Structure After Build

```
public/                 # Static client assets (served by Vercel CDN)
├── index.html         # Main HTML file
├── assets/            # CSS, JS, and image assets
│   ├── index.css     # Compiled styles
│   ├── index.js      # Client bundle
│   └── images/       # Static images
api/
├── index.js          # Serverless function entry point
└── package.json      # Function dependencies
dist/
└── index.js          # Bundled server code
vercel.json           # Vercel configuration
```

## Environment Variables

Set these environment variables in your Vercel dashboard:

### Required Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Firebase Configuration
```env
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id
```

### Optional Services
```env
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key
```

## Vercel Configuration Features

### Routing
- `/api/*` → Serverless function (API routes)
- `/assets/*` → Static assets with optimal caching
- `/*` → Client-side routing (SPA)

### Performance Optimizations
- Static assets cached for 1 year with immutable headers
- Serverless function using Node.js 18.x runtime
- Minified server bundle for faster cold starts

### Build Process
1. **Client Build**: Vite builds optimized frontend assets
2. **Server Bundle**: esbuild creates serverless-compatible server
3. **File Organization**: Moves assets to Vercel-expected locations
4. **Dependencies**: Creates function-specific package.json

## Deployment Commands

### Development Preview
```bash
vercel
```

### Production Deployment
```bash
vercel --prod
```

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs [deployment-url]
```

## Domain Configuration

### Custom Domain
1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel

### SSL Certificate
- Automatically provisioned by Vercel
- Supports custom domains with free SSL

## Performance Metrics

### Bundle Sizes
- Client bundle: ~858KB (minified + gzipped)
- Server bundle: ~68KB (minified)
- Static assets: ~1.3MB total

### Expected Performance
- First paint: ~1-2 seconds
- API response time: ~100-300ms
- Cold start time: ~500ms-1s

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   ```
   Error: Missing required environment variable
   ```
   Solution: Set all required environment variables in Vercel dashboard

2. **Function Timeout**
   ```
   Error: Function execution timed out
   ```
   Solution: Optimize database queries or increase function timeout in vercel.json

3. **Import Errors**
   ```
   Error: Cannot resolve module
   ```
   Solution: Check that all external dependencies are properly listed

### Debug Mode
Add to environment variables:
```env
DEBUG=*
VERCEL_DEBUG=1
```

### Function Logs
```bash
# View real-time logs
vercel logs --follow

# View specific function logs
vercel logs --scope=function
```

## Advanced Configuration

### Custom Build Command
Edit `vercel.json` to modify build behavior:
```json
{
  "buildCommand": "node vercel-build.js && echo 'Custom post-build steps'"
}
```

### Function Configuration
```json
{
  "functions": {
    "api/index.js": {
      "runtime": "nodejs18.x",
      "maxDuration": 10
    }
  }
}
```

### Custom Headers
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## Monitoring and Analytics

### Vercel Analytics
- Automatically enabled for web vitals
- View in Vercel dashboard → Analytics

### Function Insights
- Monitor serverless function performance
- Track invocations and execution time
- Available in dashboard → Functions

## Security

### Environment Variables
- Stored securely in Vercel
- Not exposed to client-side code
- Automatically encrypted

### Dependencies
- All dependencies externalized (not bundled)
- Regular security updates through package managers
- Minimal attack surface in serverless functions

## Cost Optimization

### Free Tier Limits
- 100GB bandwidth per month
- 100 deployments per day
- Unlimited static sites

### Pro Features
- Advanced analytics
- Team collaboration
- Priority support
- Higher function limits

## Next Steps

1. Deploy to Vercel using CLI or GitHub integration
2. Configure custom domain if needed
3. Set up monitoring and alerts
4. Configure CI/CD pipeline for automatic deployments

Your application is now ready for production deployment on Vercel with all CommonJS/ESM issues resolved!