# CrossFit PR Tracker - PWA Setup Guide

This guide will help you install your CrossFit PR Tracker as a Progressive Web App (PWA) on your iPhone, allowing you to use it offline at the gym!

## What You'll Get

- **Works 100% Offline**: Once installed, the app works completely offline at the gym
- **Home Screen Icon**: Looks and feels like a native app
- **No Apple Developer Account**: No need to pay for development certificates
- **Local Data**: All your PR data stays on your iPhone (localStorage)
- **Import/Export**: JSON import/export functionality still works

## Setup Steps

### 1. Build the Docker Image

First, make sure you have Docker installed on your Mac. Then run:

```bash
# Build the Docker image and start the container
docker-compose up -d --build
```

The app will be available at: `http://localhost:3000`

### 2. Find Your Mac's Local IP Address

You need to access the app from your iPhone using your Mac's local network IP:

```bash
# On Mac, run:
ipconfig getifaddr en0
```

This will show your Mac's local IP (e.g., `192.168.1.100`)

### 3. Access from iPhone (on same WiFi)

1. Make sure your iPhone is on the **same WiFi network** as your Mac
2. Open Safari on your iPhone
3. Go to: `http://YOUR_MAC_IP:3000` (e.g., `http://192.168.100.2:3000`)
4. The app should load!

### 4. Install as PWA on iPhone

Once the app loads in Safari:

1. Tap the **Share** button (square with arrow pointing up)
2. Scroll down and tap **"Add to Home Screen"**
3. Give it a name (e.g., "PR Tracker")
4. Tap **"Add"**

### 5. Test Offline Functionality

**IMPORTANT**: After installing, close the app and reopen it from the home screen to ensure the service worker registers properly.

To verify it works offline:
1. Open the app from your home screen
2. Use it for a bit (browse exercises, add a PR)
3. Turn on Airplane Mode
4. Close and reopen the app
5. It should still work perfectly!

## Daily Usage

- **At Home**: Keep Docker running (`docker-compose up -d`)
- **At the Gym**: Use the app completely offline from your home screen!
- **To Stop**: `docker-compose down`
- **To Restart**: `docker-compose up -d`

## Data Management

Your data is stored in your iPhone's browser localStorage, completely separate from your Mac:

- **Export Data**: Use the Settings screen to export your PRs as JSON
- **Backup**: Save exported JSON files to iCloud or Files app
- **Import**: Import JSON files from Settings if you reset your browser data

## Updating the App

When you make changes to the code:

```bash
# 1. Rebuild the web version
npm run web:build

# 2. Rebuild and restart Docker
docker-compose up -d --build

# 3. On your iPhone, hard refresh the page in Safari
# 4. Re-add to home screen if needed
```

## Troubleshooting

**App won't load on iPhone:**
- Verify iPhone and Mac are on same WiFi
- Check firewall settings on Mac
- Try accessing `http://YOUR_MAC_IP:8080` directly in Safari first

**Offline mode not working:**
- Make sure you opened the app from the home screen icon (not Safari)
- Check browser console for service worker registration errors
- Try removing and re-adding the app to home screen

**Data not persisting:**
- Don't clear Safari data/cache
- Data is stored per-browser, don't use Private Browsing

**Can't access from outside home:**
- This is by design - the app runs locally on your Mac
- Once installed as PWA, it works offline everywhere!

**Port already in use:**
- Change the port in docker-compose.yml (e.g., "3001:80")
- Stop other containers: `docker ps` and `docker stop <container_id>`

## Technical Details

- **Port**: 3000 (configurable in docker-compose.yml)
- **Storage**: Browser localStorage (persists across sessions)
- **Cache**: Service Worker caches all assets for offline use
- **Updates**: Service worker auto-updates when files change

## Need to Rebuild?

If you modify the source code:

```bash
# Export new web build
npx expo export --platform web

# Rebuild Docker image
docker-compose up -d --build
```

Enjoy tracking your PRs offline! 💪
