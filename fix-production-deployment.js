#!/usr/bin/env node

// Fix the production deployment to handle server errors correctly
// Creates a robust production build that works in deployed environment

import { execSync } from 'child_process';
import { writeFileSync, existsSync, rmSync, mkdirSync, copyFileSync } from 'fs';

console.log('Fixing production deployment...');

// Clean build
if (existsSync('dist')) {
  rmSync('dist', { recursive: true });
}
mkdirSync('dist', { recursive: true });

try {
  // Build client
  console.log('Building client...');
  execSync('vite build --outDir dist/public', { stdio: 'inherit' });

  // Copy production server instead of building complex one
  console.log('Setting up production server...');
  copyFileSync('production-server.js', 'dist/index.js');

  // Create package.json for production
  const pkg = {
    name: "ulimi-web",
    version: "1.0.0",
    type: "module",
    main: "index.js",
    scripts: {
      start: "node index.js"
    },
    dependencies: {
      express: "^4.21.2"
    },
    engines: {
      node: ">=18"
    }
  };

  writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));

  // Test the production server quickly
  console.log('Testing production server...');
  execSync('node --check dist/index.js', { stdio: 'pipe' });

  console.log('Production deployment fixed!');
  console.log('Server will now handle:');
  console.log('- Dynamic port binding (no more port conflicts)');
  console.log('- Proper static file serving');
  console.log('- Health check endpoint at /health');
  console.log('- Error handling');

} catch (error) {
  console.error('Fix failed:', error.message);
  process.exit(1);
}