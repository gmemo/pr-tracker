# Deployment Guide

## ✅ Docker Deployment (Local/Self-Hosted)

### Quick Start

```bash
# Build the Docker image
docker build -t pr-tracker .

# Run with Docker Compose (recommended)
docker compose up -d

# Or run with Docker directly
docker run -d -p 3000:80 --name pr-tracker pr-tracker
```

### Accessing the App

- **Local**: http://localhost:3000
- **Network**: http://YOUR_IP_ADDRESS:3000 (e.g., http://192.168.100.2:3000)

### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker compose logs -f

# Stop the container
docker compose down

# Restart the container
docker compose restart

# Remove the container and image
docker compose down
docker rmi pr-tracker
```

### Finding Your IP Address

**Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

**Linux:**
```bash
hostname -I
```

---

## 🚀 Vercel Deployment (Recommended for Public Access)

### Option 1: Deploy via Git (Automatic Updates)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/pr-tracker.git
   git push -u origin main
   ```

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect settings (if not, use settings below)
   - Click "Deploy"

3. **Build Settings** (if needed)
   - **Framework Preset**: Other
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Done!**
   - Your app will be live at `https://your-project.vercel.app`
   - Every git push will auto-deploy

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time)
vercel

# Deploy to production
vercel --prod
```

### Custom Domain on Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., prtracker.com)
3. Follow DNS instructions
4. Wait for SSL certificate (automatic, ~24 hours)

---

## 🌐 Alternative Hosting Options

### Cloudflare Pages

1. Push code to GitHub
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Connect repository
4. Build settings:
   - **Build command**: `npx expo export --platform web`
   - **Build output directory**: `dist`
5. Deploy

### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

Or drag & drop `dist/` folder on [netlify.com](https://netlify.com/drop)

### GitHub Pages

```bash
# Build the app
npx expo export --platform web

# Install gh-pages
npm install -g gh-pages

# Deploy to GitHub Pages
gh-pages -d dist
```

Access at: `https://yourusername.github.io/pr-tracker`

---

## 🔄 Updating the Deployment

### Docker

```bash
# Rebuild after changes
docker compose down
docker build -t pr-tracker .
docker compose up -d
```

### Vercel (Git-based)

```bash
# Just push to GitHub
git add .
git commit -m "Update feature"
git push

# Vercel auto-deploys!
```

### Vercel (CLI-based)

```bash
# Build and deploy
npx expo export --platform web
vercel --prod
```

---

## 🏷️ Changing App Name/Domain

### 1. Update App Name

Edit `app.json`:
```json
{
  "expo": {
    "name": "New App Name",
    "slug": "new-app-slug"
  }
}
```

Edit `dist/manifest.json`:
```json
{
  "name": "New App Name",
  "short_name": "Short Name"
}
```

Edit `App.tsx`:
```typescript
<NavigationContainer
  documentTitle={{
    formatter: () => 'New App Name'
  }}
>
```

### 2. Add Custom Domain (Vercel)

**Steps:**
1. Buy domain (Namecheap, Google Domains, Cloudflare)
2. Vercel → Project Settings → Domains → Add Domain
3. Add DNS records (Vercel provides instructions):
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for SSL (automatic)
5. Access your app at your custom domain!

**No code changes needed** for custom domain!

### 3. Update Repository Name

```bash
# Rename on GitHub first, then:
git remote set-url origin https://github.com/yourusername/new-repo-name.git
```

---

## 📱 Sharing Your PWA

### For Local Docker Deployment

Users need to:
1. Be on same network as your server
2. Visit: `http://YOUR_IP:3000`
3. Install PWA to home screen
4. App works offline after installation

**Limitation**: Can't share with internet users

### For Vercel/Cloud Deployment

Just share the URL!
- `https://your-app.vercel.app`
- Or your custom domain: `https://prtracker.com`

Anyone worldwide can:
1. Visit the URL
2. Install to home screen
3. Use offline

**This is the recommended approach for public sharing**

---

## 🐛 Troubleshooting

### Docker: Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or use different port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

### Vercel: Build Fails

Check build logs:
1. Go to your project on Vercel
2. Click on failed deployment
3. View build logs
4. Common issues:
   - Missing dependencies: Run `npm install` locally first
   - Node version: Vercel uses Node 18 by default

### PWA Not Installing

- Clear browser cache (Cmd+Shift+R)
- Check manifest.json is accessible
- Check service-worker.js is loaded
- Verify HTTPS (required for PWA)

### Changes Not Showing

**Docker:**
```bash
# Rebuild with --no-cache
docker build --no-cache -t pr-tracker .
docker compose restart
```

**Vercel:**
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear Vercel cache: Redeploy from dashboard

---

## 📊 Monitoring

### Docker Logs

```bash
# View logs
docker compose logs -f

# View specific container logs
docker logs crossfit-pr-tracker
```

### Vercel Analytics

1. Go to Project → Analytics
2. View page views, performance, etc.
3. Free tier includes basic analytics

---

## 🔐 Security

### Production Checklist

- [x] HTTPS enabled (automatic on Vercel)
- [x] Security headers configured
- [x] No sensitive data in code
- [x] No API keys exposed
- [x] Service worker properly cached
- [x] CSP headers (optional, add if needed)

---

## 💡 Tips

1. **Test locally first**: Always test Docker build locally before deploying
2. **Use git branches**: Create feature branches, test before merging to main
3. **Backup data**: Users should export their data regularly
4. **Monitor errors**: Check Vercel logs for any issues
5. **Update dependencies**: Run `npm update` regularly for security patches

---

## 📞 Need Help?

- Check README.md for general info
- Check NEXT_STEPS.txt for future plans
- Open an issue on GitHub
- Contact: [your email]

---

**Last Updated**: 2025-10-16
**Version**: 1.0.0
