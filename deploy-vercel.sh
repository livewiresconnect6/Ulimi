#!/bin/bash

# Ulimi Vercel Deployment Script
# One-click deployment to Vercel

set -e

echo "🚀 Deploying Ulimi to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build for Vercel
echo "🔨 Building for Vercel..."
node vercel-build.js

# Verify build outputs
echo "✅ Verifying build outputs..."
if [ ! -f "public/index.html" ]; then
    echo "❌ Build failed - public/index.html not found"
    exit 1
fi

if [ ! -f "api/index.js" ]; then
    echo "❌ Build failed - api/index.js not found"
    exit 1
fi

echo "📊 Build Summary:"
echo "  ✓ Static assets: $(du -sh public | cut -f1)"
echo "  ✓ API function: $(du -sh api/index.js | cut -f1)"
echo "  ✓ Server bundle: $(du -sh dist/index.js | cut -f1)"

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."
echo "Note: You may need to login to Vercel if this is your first deployment"

# Check if user wants production deployment
read -p "Deploy to production? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
else
    vercel
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Configure custom domain (optional)"
echo "  3. Monitor deployment at https://vercel.com/dashboard"
echo ""
echo "📖 For more details, see VERCEL_DEPLOYMENT.md"