#!/usr/bin/env node

// Override the broken npm build process entirely
// This script completely replaces the problematic build:server command

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Overriding broken build process...');

// Step 1: Replace the problematic build:server script temporarily
const packagePath = resolve(__dirname, 'package.json');
const packageContent = readFileSync(packagePath, 'utf-8');
const packageJson = JSON.parse(packageContent);

// Backup original and replace with working script
const originalBuildServer = packageJson.scripts['build:server'];
packageJson.scripts['build:server'] = 'node build.js';

writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ Temporarily replaced build:server with working ESM script');

try {
  // Clean build directory
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true });
  }
  mkdirSync('dist', { recursive: true });

  // Now run the build process
  console.log('🏗️ Running corrected build process...');
  execSync('npm run build', { stdio: 'inherit' });

  // Handle client build location if needed
  if (existsSync('./client/dist/public') && !existsSync('./dist/public')) {
    execSync('mv ./client/dist/public ./dist/public');
    console.log('📁 Corrected client build location');
  }

  // Create production package.json in dist
  const prodPackage = {
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
  writeFileSync('./dist/package.json', JSON.stringify(prodPackage, null, 2));

  console.log('✅ Build override successful!');
  
  // Verify deployment readiness
  if (existsSync('./dist/index.js') && existsSync('./dist/public/index.html')) {
    console.log('🎉 DEPLOYMENT READY - All files built successfully');
  }

} catch (error) {
  console.error('❌ Build override failed:', error.message);
  process.exit(1);
} finally {
  // Restore original package.json
  packageJson.scripts['build:server'] = originalBuildServer;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log('🔄 Restored original package.json');
}