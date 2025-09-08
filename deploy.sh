#!/bin/bash

# Deploy script for Ulimi Web Application
# Handles ESM/CommonJS compatibility and production builds

set -e  # Exit on any error

echo "🚀 Starting Ulimi deployment process..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
mkdir -p dist

# Build client (frontend)
echo "🏗️  Building client application..."
npm run build:client

if [ ! -d "dist/public" ] && [ ! -d "client/dist/public" ]; then
    echo "❌ Client build failed - no public directory found in dist/ or client/dist/"
    exit 1
fi

# Move client build to correct location if needed
if [ -d "client/dist/public" ] && [ ! -d "dist/public" ]; then
    echo "📁 Moving client build to correct location..."
    mv client/dist/public dist/public
fi

echo "✅ Client build completed successfully"

# Build server with ESM support
echo "🏗️  Building server with ESM support..."
node build.js

if [ ! -f "dist/index.js" ]; then
    echo "❌ Server build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Server build completed successfully"

# Verify build outputs
echo "📋 Verifying build outputs..."
echo "Client files:"
ls -la dist/public/ | head -10

echo -e "\nServer file:"
ls -la dist/index.js

echo -e "\nServer file size:"
du -h dist/index.js

# Test server syntax
echo "🧪 Testing server syntax..."
node --check dist/index.js
echo "✅ Server syntax validation passed"

# Database setup (if needed)
if [ "$NODE_ENV" != "production" ]; then
    echo "🗄️  Setting up database schema..."
    if npm run db:push 2>/dev/null; then
        echo "✅ Database schema updated"
    else
        echo "⚠️  Database setup skipped (run 'npm run db:push' manually if needed)"
    fi
fi

echo "🎉 Deployment build completed successfully!"
echo ""
echo "📦 Build outputs:"
echo "  - Client: dist/public/"
echo "  - Server: dist/index.js"
echo ""
echo "🚀 To start in production mode:"
echo "  NODE_ENV=production node dist/index.js"
echo ""
echo "🔧 Environment variables needed:"
echo "  - DATABASE_URL (PostgreSQL connection string)"
echo "  - VITE_FIREBASE_API_KEY (Firebase configuration)"
echo "  - VITE_FIREBASE_PROJECT_ID (Firebase project ID)"
echo "  - VITE_FIREBASE_APP_ID (Firebase app ID)"