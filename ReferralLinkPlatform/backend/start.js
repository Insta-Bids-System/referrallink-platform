#!/usr/bin/env node

// Simple startup script for Railway
console.log('Starting ReferralLink Backend Server...');
console.log('Node version:', process.version);
console.log('Current directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check if dist folder exists
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const serverPath = path.join(distPath, 'server.js');

if (!fs.existsSync(distPath)) {
  console.error('ERROR: dist folder not found! Run npm run build first.');
  process.exit(1);
}

if (!fs.existsSync(serverPath)) {
  console.error('ERROR: dist/server.js not found! Build may have failed.');
  process.exit(1);
}

console.log('dist folder found ✓');
console.log('server.js found ✓');
console.log('Starting server from dist/server.js...');

// Start the actual server
require('./dist/server.js');