#!/usr/bin/env node

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildForProduction() {
  console.log('🚀 Building for deployment with ESM compatibility...');
  
  // Clean dist directory
  if (existsSync('dist')) {
    rmSync('dist', { recursive: true });
  }
  mkdirSync('dist', { recursive: true });

  try {
    // Build server with comprehensive ESM support
    console.log('🏗️  Building server...');
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/index.js',
      external: [
        // Core Node.js modules
        'fs', 'path', 'url', 'http', 'https', 'crypto', 'events', 'stream',
        // Application dependencies
        'express', 'pg', '@neondatabase/serverless', 'drizzle-orm', 'drizzle-zod',
        'firebase', 'firebase-admin', 'zod', 'zod-validation-error',
        // Build-time only dependencies
        'vite', '@vitejs/plugin-react', 'esbuild', 'tsx',
        '@replit/vite-plugin-cartographer', '@replit/vite-plugin-runtime-error-modal',
        // Babel and related
        '@babel/core', '@babel/preset-typescript', 'lightningcss',
        // Other potential issues
        'fsevents', 'rollup'
      ],
      banner: {
        js: `
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

global.__filename = __filename;
global.__dirname = __dirname;
global.require = require;
`
      },
      define: {
        'process.env.NODE_ENV': '"production"',
        'import.meta.dirname': '__dirname'
      },
      minify: false,
      sourcemap: false,
      keepNames: true,
      logLevel: 'warning'
    });

    console.log('✅ Server build completed');

    // Test server syntax
    console.log('🧪 Testing server...');
    const { execSync } = await import('child_process');
    execSync('node --check dist/index.js');
    console.log('✅ Server syntax valid');

    return true;

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    return false;
  }
}

buildForProduction().then(success => {
  if (success) {
    console.log('🎉 ESM-safe build completed!');
    console.log('Ready for deployment: node dist/index.js');
  } else {
    process.exit(1);
  }
});