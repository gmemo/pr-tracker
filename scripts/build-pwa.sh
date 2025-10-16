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

# Step 3: Update index.html to include PWA meta tags
echo "✏️  Updating index.html..."
sed -i '' 's|<title>CrossFit PR Tracker</title>|<title>CrossFit PR Tracker</title>\
    <link rel="manifest" href="/manifest.json" />\
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />\
    <meta name="theme-color" content="#0A0A0A" />|' dist/index.html

echo "✅ PWA build complete!"
echo "📂 Output: dist/"
