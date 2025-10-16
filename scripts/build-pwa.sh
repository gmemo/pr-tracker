#!/bin/bash
set -e

echo "🏗️  Building PWA..."

# Step 1: Clean and build with Expo
echo "📦 Exporting web build..."
rm -rf dist
npx expo export --platform web

# Step 2: Copy PWA assets
echo "📋 Copying PWA assets..."
cp public/manifest.json dist/
cp public/icon-192.png dist/
cp public/icon-512.png dist/
cp public/apple-touch-icon.png dist/
cp public/service-worker.js dist/

# Step 3: Update index.html to include PWA meta tags
node scripts/inject-pwa-meta.js

echo "✅ PWA build complete!"
echo "📂 Output: dist/"
