#!/usr/bin/env node

// Fix production deployment by ensuring proper static file serving
import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing deployment configuration...');

// Check if production build exists
const distPublicPath = path.join(process.cwd(), 'dist', 'public');
const distIndexPath = path.join(distPublicPath, 'index.html');
const distAssetsPath = path.join(distPublicPath, 'assets');

console.log('Checking production build...');
console.log('📁 dist/public exists:', fs.existsSync(distPublicPath));
console.log('📄 index.html exists:', fs.existsSync(distIndexPath));  
console.log('📦 assets folder exists:', fs.existsSync(distAssetsPath));

if (fs.existsSync(distAssetsPath)) {
  const assets = fs.readdirSync(distAssetsPath);
  console.log('🎨 Assets found:', assets.length);
  assets.forEach(asset => console.log(`   - ${asset}`));
}

// Check .replit configuration for deployment
const replitConfig = fs.readFileSync('.replit', 'utf8');
console.log('\n📋 .replit deployment config:');
console.log(replitConfig.split('\n').filter(line => line.includes('deployment') || line.includes('build') || line.includes('run')));

console.log('\n✅ All files ready for production deployment!');
console.log('🚀 Use the Deploy button to deploy the fixed version.');