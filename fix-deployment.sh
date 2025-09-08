#!/bin/bash

echo "🚀 FINAL DEPLOYMENT FIX"

# Clean and create dist
rm -rf dist/
mkdir -p dist

# Build client first
echo "🏗️  Building client..."
npm run build:client

# Check where client build ended up and move if needed
if [ -d "client/dist/public" ]; then
    echo "📁 Moving client build..."
    mv client/dist/public dist/public
fi

# Verify client build exists
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Client build failed - no index.html found"
    exit 1
fi

# Build server with working ESM script
echo "🏗️  Building server..."
node build.js

# Verify server build
if [ ! -f "dist/index.js" ]; then
    echo "❌ Server build failed"
    exit 1
fi

# Test syntax
echo "🧪 Testing server syntax..."
node --check dist/index.js

# Create production package.json
cat > dist/package.json << 'EOF'
{
  "name": "ulimi-web",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "engines": {
    "node": ">=18"
  }
}
EOF

echo "✅ DEPLOYMENT READY!"
echo ""
echo "📦 Build outputs:"
ls -la dist/
echo ""
echo "Client files:"
ls -la dist/public/ | head -5
echo ""
echo "🚀 Ready for deployment!"