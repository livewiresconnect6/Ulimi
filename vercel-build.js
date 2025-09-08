#!/usr/bin/env node

import { build } from 'esbuild';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function buildForVercel() {
  console.log('🚀 Building Ulimi for Vercel deployment...');
  
  try {
    // Build client first
    console.log('📦 Building client...');
    execSync('npm run build:client', { stdio: 'inherit' });
    
    // Create public directory structure for Vercel
    console.log('📁 Setting up Vercel directory structure...');
    
    // Copy client build to public directory
    if (fs.existsSync('client/dist')) {
      if (fs.existsSync('public')) {
        execSync('rm -rf public', { stdio: 'inherit' });
      }
      execSync('cp -r client/dist public', { stdio: 'inherit' });
    } else if (fs.existsSync('dist/public')) {
      if (fs.existsSync('public')) {
        execSync('rm -rf public', { stdio: 'inherit' });
      }
      execSync('cp -r dist/public public', { stdio: 'inherit' });
    }
    
    // Build server for Vercel serverless
    console.log('🔧 Building server for Vercel serverless...');
    await build({
      entryPoints: ['server/index.ts'],
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'node18',
      outfile: 'dist/index.js',
      external: [
        // Core Node.js modules
        'fs', 'path', 'url', 'http', 'https', 'crypto', 'stream', 
        'events', 'util', 'buffer', 'os', 'child_process', 'module',
        'assert', 'querystring', 'zlib', 'net', 'tls', 'dns',
        
        // External dependencies for Vercel
        'express',
        '@neondatabase/serverless',
        'drizzle-orm',
        'drizzle-kit',
        'pg',
        'firebase',
        'zod',
        'drizzle-zod',
        'express-session',
        'zod-validation-error',
        
        // Build tools that shouldn't be bundled in serverless
        'vite',
        'esbuild',
        'tsx',
        'typescript',
        'rollup',
        'prettier',
        'eslint',
        'autoprefixer',
        'postcss',
        'tailwindcss',
        'tailwindcss-animate',
        '@tailwindcss/typography',
        'lightningcss',
        
        // Babel packages
        '@babel/core',
        '@babel/preset-typescript',
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/parser',
        '@babel/traverse',
        '@babel/types',
        '@babel/generator',
        '@babel/template',
        '@babel/helper-compilation-targets',
        '@babel/helper-module-transforms',
        
        // Vite plugins
        '@vitejs/plugin-react',
        '@replit/vite-plugin-cartographer',
        '@replit/vite-plugin-runtime-error-modal',
        
        // Frontend-only dependencies
        'react',
        'react-dom',
        '@tanstack/react-query',
        'wouter',
        'framer-motion',
        'lucide-react',
        'react-hook-form',
        '@hookform/resolvers',
        'class-variance-authority',
        'clsx',
        'tailwind-merge',
        
        // Radix UI packages
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-label',
        '@radix-ui/react-popover',
        '@radix-ui/react-progress',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-slot',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
        '@radix-ui/react-tooltip'
      ],
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

global.__filename = __filename;
global.__dirname = __dirname;
global.require = require;
`
      },
      define: {
        'import.meta.dirname': '__dirname',
        'process.env.NODE_ENV': '"production"'
      },
      mainFields: ['module', 'main'],
      conditions: ['import', 'node'],
      allowOverwrite: true,
      sourcemap: false, // Disable for smaller bundle
      minify: true,     // Enable minification for Vercel
      keepNames: false
    });
    
    // Create Vercel-specific package.json for serverless function
    console.log('📝 Creating Vercel function configuration...');
    const vercelPackageJson = {
      "type": "module",
      "dependencies": {
        "express": "^4.21.2",
        "@neondatabase/serverless": "^1.0.1",
        "drizzle-orm": "^0.30.10",
        "drizzle-zod": "^0.5.1",
        "pg": "^8.16.3",
        "firebase": "^10.14.1",
        "express-session": "^1.18.0",
        "zod": "^3.25.76",
        "zod-validation-error": "^3.0.3"
      }
    };
    
    fs.writeFileSync('api/package.json', JSON.stringify(vercelPackageJson, null, 2));
    
    console.log('✅ Vercel build completed successfully!');
    console.log('📁 Output structure:');
    console.log('  - public/ - Static client assets');
    console.log('  - api/index.js - Serverless function entry');
    console.log('  - dist/index.js - Bundled server code');
    console.log('🎉 Ready for Vercel deployment!');
    
  } catch (error) {
    console.error('❌ Vercel build failed:', error);
    process.exit(1);
  }
}

buildForVercel();