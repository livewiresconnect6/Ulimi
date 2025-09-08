#!/bin/bash

# Super Simple Vercel Deployment
# Just run this file and follow the instructions

clear
echo "========================================="
echo "   SIMPLE VERCEL DEPLOYMENT FOR ULIMI"
echo "========================================="
echo ""

# Step 1: Check if everything is ready
echo "Step 1: Checking if your app is ready..."
if [ ! -f "vercel.json" ]; then
    echo "❌ Your app is not ready for Vercel. Please set it up first."
    exit 1
fi
echo "✅ Your app is ready!"
echo ""

# Step 2: Install Vercel if needed
echo "Step 2: Setting up Vercel..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI (this might take a minute)..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI"
        echo "Try running: npm install -g vercel"
        exit 1
    fi
fi
echo "✅ Vercel CLI is ready!"
echo ""

# Step 3: Build the app
echo "Step 3: Building your app..."
node vercel-build.js
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check the error messages above."
    exit 1
fi
echo "✅ App built successfully!"
echo ""

# Step 4: Deploy
echo "Step 4: Deploying to Vercel..."
echo ""
echo "📝 IMPORTANT: When Vercel asks questions:"
echo "   - Project name: Press Enter to use default"
echo "   - Deploy location: Press Enter to use current directory"
echo "   - Override settings: Type 'N' and press Enter"
echo ""
echo "🔐 If this is your first time:"
echo "   - Vercel will ask you to login"
echo "   - It will open a web browser"
echo "   - Follow the login instructions"
echo ""

read -p "Ready to deploy? Press Enter to continue..."

echo ""
echo "🚀 Deploying to production..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your app is now live on the internet!"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Click on your project"
    echo "3. Go to Settings → Environment Variables"
    echo "4. Add your database and API keys"
    echo ""
    echo "🌐 Your app URL was shown above - bookmark it!"
else
    echo ""
    echo "❌ Deployment failed. Common solutions:"
    echo "1. Make sure you're logged into Vercel"
    echo "2. Check your internet connection"
    echo "3. Try running the command again"
    echo ""
    echo "Need help? Check SIMPLE_VERCEL_DEPLOY.md"
fi