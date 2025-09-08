#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure dist directory exists
mkdirSync(resolve(__dirname, 'dist'), { recursive: true });

// Create ESM-compatible shims for __dirname and __filename
const shimContent = `
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

global.__filename = __filename;
global.__dirname = __dirname;
`;

writeFileSync(resolve(__dirname, 'dist', 'esm-shim.js'), shimContent);

try {
  console.log('Building server with ESM support...');
  
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    external: [
      'express',
      'pg', 
      '@neondatabase/serverless',
      'drizzle-orm',
      'firebase',
      'firebase-admin',
      'vite',
      '@vitejs/plugin-react',
      '@replit/vite-plugin-cartographer',
      '@replit/vite-plugin-runtime-error-modal'
    ],
    banner: {
      js: 'import { fileURLToPath } from "url"; import { dirname } from "path"; const __filename = fileURLToPath(import.meta.url); const __dirname = dirname(__filename);'
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    minify: false,
    sourcemap: false,
    keepNames: true,
    logLevel: 'info'
  });

  console.log('✅ Server build completed successfully');
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}