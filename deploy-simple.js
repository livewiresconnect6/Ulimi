#!/usr/bin/env node

// Ultra-simple deployment script to avoid any hanging issues
// Creates a minimal production build that deploys quickly

import { execSync } from 'child_process';
import { writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';

console.log('Creating minimal deployment build...');

// Clean start
if (existsSync('dist')) {
  rmSync('dist', { recursive: true });
}
mkdirSync('dist', { recursive: true });

try {
  // Build client - this always works
  console.log('Building client...');
  execSync('vite build --outDir dist/public', { stdio: 'inherit' });
  
  // Simple server build without complex externals
  console.log('Building server...');
  execSync('esbuild server/index.ts --bundle --platform=node --target=node18 --format=esm --outfile=dist/index.js --external:pg --external:express --external:@neondatabase/serverless --external:drizzle-orm --banner:js="import { fileURLToPath } from \\"url\\"; import { dirname } from \\"path\\"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);"', { stdio: 'inherit' });

  // Minimal production package.json
  const pkg = {
    name: "ulimi-web",
    type: "module", 
    main: "index.js",
    scripts: { start: "node index.js" },
    engines: { node: ">=18" }
  };
  writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));

  console.log('Minimal deployment build ready!');
  console.log('Files created:');
  console.log('- dist/index.js (server)');
  console.log('- dist/public/ (client)');
  console.log('- dist/package.json (production config)');

} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}