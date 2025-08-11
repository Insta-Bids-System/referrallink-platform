// Simple startup script for Railway deployment
const path = require('path');

// Set the working directory to backend
process.chdir(__dirname);

// Load environment variables
require('dotenv').config();

// Start the server
require('./dist/server.js');