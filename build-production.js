#!/usr/bin/env node

// Production build script that bypasses package.json build issues
// This script ensures proper ESM/CommonJS compatibility for deployment

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { resolve } from 'path';

console.log('🚀 Starting production build process...');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
if (existsSync('./dist')) {
  rmSync('./dist', { recursive: true, force: true });
}
mkdirSync('./dist', { recursive: true });

try {
  // Build client (this works fine)
  console.log('🏗️  Building client application...');
  execSync('npm run build:client', { stdio: 'inherit' });
  
  // Check if client build output is in the wrong location and fix it
  if (existsSync('./client/dist/public') && !existsSync('./dist/public')) {
    console.log('📁 Moving client build to correct location...');
    execSync('mv ./client/dist/public ./dist/public', { stdio: 'inherit' });
  }

  // Build server using our ESM-compatible script
  console.log('🏗️  Building server with ESM support...');
  execSync('node build.js', { stdio: 'inherit' });

  // Verify builds
  if (!existsSync('./dist/public/index.html')) {
    throw new Error('Client build failed - index.html not found');
  }
  
  if (!existsSync('./dist/index.js')) {
    throw new Error('Server build failed - index.js not found');
  }

  // Test server syntax
  console.log('🧪 Testing server syntax...');
  execSync('node --check dist/index.js', { stdio: 'inherit' });

  console.log('🎉 Production build completed successfully!');
  console.log('\n📦 Build outputs:');
  console.log('  - Client: dist/public/');
  console.log('  - Server: dist/index.js');
  console.log('\n🚀 To start in production:');
  console.log('  NODE_ENV=production node dist/index.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}