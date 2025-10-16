#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

console.log('✏️  Injecting PWA meta tags into index.html...');

// Read the index.html file
let html = fs.readFileSync(indexPath, 'utf8');

// Define the PWA meta tags to inject
const pwaTags = `
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#0A0A0A" />`;

// Inject after the title tag
html = html.replace(
  '<title>CrossFit PR Tracker</title>',
  `<title>CrossFit PR Tracker</title>${pwaTags}`
);

// Write back to file
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ PWA meta tags injected successfully!');
