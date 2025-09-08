// Build configuration for deployment
export default {
  esbuild: {
    entryPoints: ['server/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node18',
    outfile: 'dist/index.js',
    external: [
      // Node.js built-in modules
      'fs', 'path', 'url', 'http', 'https', 'crypto', 'stream', 
      'events', 'util', 'buffer', 'os', 'child_process', 'module',
      
      // Server dependencies
      'express',
      '@neondatabase/serverless',
      'drizzle-orm',
      'drizzle-kit', 
      'pg',
      'firebase',
      'zod',
      'drizzle-zod',
      'express-session',
      
      // Build and development tools
      'vite',
      'esbuild',
      'tsx',
      '@vitejs/plugin-react',
      
      // Frontend dependencies (not needed in server bundle)
      'react',
      'react-dom',
      '@tanstack/react-query',
      'wouter',
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-*',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'tailwindcss',
      'tailwindcss-animate'
    ],
    banner: {
      js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global compatibility
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
    sourcemap: true,
    minify: false,
    keepNames: true
  },
  
  vite: {
    build: {
      outDir: 'dist/public',
      emptyOutDir: true,
      target: 'esnext',
      minify: 'esbuild',
      sourcemap: true
    }
  }
};