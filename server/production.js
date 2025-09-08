// Production entry point with CommonJS/ESM compatibility
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up global compatibility variables
global.__filename = __filename;
global.__dirname = __dirname;
global.require = require;

// Set production environment
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import and start the main application
import('./index.js').catch(error => {
  console.error('Failed to start production server:', error);
  process.exit(1);
});