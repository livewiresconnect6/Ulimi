#!/usr/bin/env node

// Create a deployment-ready version of the app
// This permanently fixes the build issues for Replit deployment

import { writeFileSync, readFileSync, existsSync, rmSync, mkdirSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('Creating deployment-ready configuration...');

// Create a working package.json with fixed build scripts
const packageJson = {
  "name": "ulimi-web",
  "version": "1.0.0", 
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "node deployment-ready.js --build-only",
    "build:client": "vite build --outDir dist/public", 
    "build:server": "node build.js",
    "start": "node dist/index.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate", 
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  }
};

// Handle build-only mode (called by npm run build)
if (process.argv.includes('--build-only')) {
  console.log('Running deployment build...');
  
  // Clean dist
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true });
  }
  mkdirSync('dist', { recursive: true });
  
  // Build client
  console.log('Building client...');
  execSync('vite build --outDir dist/public', { stdio: 'inherit' });
  
  // Handle client build location
  if (existsSync('./client/dist/public') && !existsSync('./dist/public')) {
    execSync('mv ./client/dist/public ./dist/public');
  }
  
  // Build server
  console.log('Building server...');
  execSync('node build.js', { stdio: 'inherit' });
  
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
  
  console.log('Deployment build complete!');
  process.exit(0);
}

// Copy dependencies from original package.json
try {
  const originalPackage = JSON.parse(readFileSync('package.json', 'utf-8'));
  packageJson.dependencies = originalPackage.dependencies;
  packageJson.devDependencies = originalPackage.devDependencies;
  packageJson.engines = originalPackage.engines;
} catch (error) {
  console.log('Note: Could not copy dependencies from original package.json');
}

// Write the fixed package.json
writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('Updated package.json with working build scripts');

// Run the build to verify it works
console.log('Testing build process...');
execSync('npm run build', { stdio: 'inherit' });

console.log('Deployment configuration ready! Replit deployment should now work.');
console.log('The build process now uses working ESM scripts instead of the broken esbuild command.');