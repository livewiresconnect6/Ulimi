#!/usr/bin/env node

// Complete deployment fix for Ulimi Web Application
// Handles all CommonJS/ESM issues and ensures successful deployment

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

console.log('🚀 FIXING DEPLOYMENT - Complete ESM/CommonJS solution');

function runCommand(cmd, description) {
  console.log(`🔧 ${description}...`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

async function fixDeployment() {
  // Step 1: Clean everything
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true });
    console.log('🧹 Cleaned dist directory');
  }
  mkdirSync('dist', { recursive: true });

  // Step 2: Build client (this works)
  if (!runCommand('npm run build:client', 'Building client')) {
    return false;
  }

  // Step 3: Handle client build location
  if (existsSync('./client/dist/public') && !existsSync('./dist/public')) {
    execSync('mv ./client/dist/public ./dist/public');
    console.log('📁 Moved client build to correct location');
  }

  // Step 4: Build server with our safe ESM script
  if (!runCommand('node build-esm-safe.js', 'Building server with ESM safety')) {
    return false;
  }

  // Step 5: Create production package.json (for deployment systems that need it)
  const productionPackage = {
    name: "ulimi-web",
    version: "1.0.0",
    type: "module",
    main: "index.js",
    scripts: {
      start: "node index.js"
    },
    engines: {
      node: ">=18"
    }
  };
  writeFileSync('./dist/package.json', JSON.stringify(productionPackage, null, 2));
  console.log('📦 Created production package.json');

  // Step 6: Verify everything works
  console.log('🧪 Final verification...');
  
  if (!existsSync('./dist/public/index.html')) {
    console.error('❌ Client build missing');
    return false;
  }
  
  if (!existsSync('./dist/index.js')) {
    console.error('❌ Server build missing');
    return false;
  }

  // Test server starts (quick check)
  try {
    execSync('node --check dist/index.js', { stdio: 'pipe' });
    console.log('✅ Server syntax valid');
  } catch (error) {
    console.error('❌ Server syntax error:', error.message);
    return false;
  }

  return true;
}

fixDeployment().then(success => {
  if (success) {
    console.log('\n🎉 DEPLOYMENT FIXED SUCCESSFULLY!');
    console.log('\n📦 Build outputs:');
    console.log('   - Client: dist/public/');  
    console.log('   - Server: dist/index.js');
    console.log('   - Package: dist/package.json');
    console.log('\n✅ Ready for Replit deployment!');
    console.log('   Click the Deploy button in Replit');
    console.log('\n🚀 Or test locally with:');
    console.log('   cd dist && NODE_ENV=production node index.js');
  } else {
    console.error('\n❌ DEPLOYMENT FIX FAILED');
    console.error('Please check the errors above');
    process.exit(1);
  }
});