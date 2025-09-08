#!/bin/bash

# Replit-compatible deployment script
# This script ensures the app builds correctly for Replit deployment

set -e

echo "🚀 Preparing for Replit deployment..."

# Use our working production build script
node build-production.js

# Verify the build worked
if [ ! -f "dist/index.js" ] || [ ! -f "dist/public/index.html" ]; then
    echo "❌ Build verification failed"
    exit 1
fi

echo "✅ Build verification passed"
echo "📦 Ready for Replit deployment!"
echo ""
echo "Build outputs:"
ls -la dist/
echo ""
echo "Client assets:"
ls -la dist/public/ | head -5
echo ""
echo "✅ Deployment ready - click Deploy in Replit!"