#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../dist/index.html');

console.log('✏️  Injecting PWA meta tags and service worker into index.html...');

// Read the index.html file
let html = fs.readFileSync(indexPath, 'utf8');

// Define the PWA meta tags to inject
const pwaTags = `
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#0A0A0A" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-capable" content="yes" />`;

// Inject after the title tag
html = html.replace(
  '<title>CrossFit PR Tracker</title>',
  `<title>CrossFit PR Tracker</title>${pwaTags}`
);

// Service worker registration script
const serviceWorkerScript = `
  <script>
    // Register service worker for offline support
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available! Refresh to update.');
                }
              });
            });
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error);
          });
      });
    }
  </script>`;

// Inject service worker registration before closing body tag
html = html.replace('</body>', `${serviceWorkerScript}\n</body>`);

// Write back to file
fs.writeFileSync(indexPath, html, 'utf8');

console.log('✅ PWA meta tags and service worker injected successfully!');
