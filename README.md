# PR Tracker - CrossFit Personal Records Tracker

A privacy-first, offline-capable Progressive Web App (PWA) for tracking CrossFit personal records. Built with React Native, Expo, and TypeScript.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📱 Features

- **100% Offline** - Works completely offline at the gym. No internet required after installation.
- **No Login Required** - No accounts, no servers, no tracking. Your data stays on your device.
- **Privacy First** - All data stored locally using AsyncStorage. No external servers, no analytics, no ads.
- **Barbell Plate Calculator** - Automatically calculates plate loading for different bar types (45lb, 35lb).
- **Percentage Training** - Calculate training weights at 70%, 80%, 90% of your PRs.
- **Historical Tracking** - Track your progress over time with charts and history.
- **Export/Import** - Backup your data as JSON files. Import anytime to recover your data.
- **Multiple Themes** - Dark/Light mode with 5 accent colors (Green, Red, Blue, Pink, Yellow).
- **Customizable Units** - Support for both lbs and kg.
- **PWA Support** - Install on iOS/Android home screen like a native app.

## 🚀 Tech Stack

- **React Native** + **Expo SDK 53**
- **TypeScript** - Type-safe development
- **React Navigation** - Bottom tab navigation
- **AsyncStorage** - Local data persistence
- **Context API** - Global state management
- **Expo File System** - Data export/import functionality
- **PWA** - Progressive Web App with offline support

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Docker (optional, for containerized deployment)

## 🛠️ Installation

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/crossfit-pr-tracker.git
cd crossfit-pr-tracker

# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run web      # Web browser
npm run ios      # iOS simulator
npm run android  # Android emulator
```

### Production Build

```bash
# Build for web (PWA)
npx expo export --platform web

# Output will be in the dist/ folder
```

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t pr-tracker .

# Run the container
docker run -d -p 3000:80 --name pr-tracker pr-tracker

# Access at http://localhost:3000
```

### Using Docker Compose

```bash
# Start the container
docker-compose up -d

# Stop the container
docker-compose down

# View logs
docker-compose logs -f
```

## 🌐 Deployment Options

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repository on [Vercel](https://vercel.com)
3. Set build settings:
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
4. Deploy!

Your app will be available at `https://your-project.vercel.app`

### Cloudflare Pages

1. Push your code to GitHub
2. Connect repository on [Cloudflare Pages](https://pages.cloudflare.com)
3. Set build settings:
   - **Build Command**: `npx expo export --platform web`
   - **Build Output Directory**: `dist`
4. Deploy!

### Netlify

1. Drag and drop the `dist/` folder on [Netlify](https://netlify.com)
2. Or connect GitHub repository with same build settings

## 📱 PWA Installation

### iOS (Safari)

1. Open the app URL in Safari
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

### Android (Chrome)

1. Open the app URL in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"
4. Tap "Install"

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── CustomHeader.tsx
│   └── PRCard.tsx
├── context/          # React Context providers
│   └── PRContext.tsx
├── screens/          # Main app screens
│   ├── PRListScreen.tsx
│   ├── ExercisesScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── SettingsScreen.tsx
│   └── WelcomeScreen.tsx
├── theme/            # Theme configuration
│   └── index.ts
├── types/            # TypeScript type definitions
│   └── index.ts
└── utils/            # Utility functions
    └── plateCalculator.ts
```

## 🎨 Customization

### Changing App Name

1. Update `app.json`:
   ```json
   {
     "name": "Your App Name",
     "slug": "your-app-slug"
   }
   ```

2. Update `dist/manifest.json`:
   ```json
   {
     "name": "Your App Name",
     "short_name": "Short Name"
   }
   ```

3. Update `App.tsx` document title:
   ```typescript
   documentTitle={{
     formatter: () => 'Your App Name'
   }}
   ```

### Changing Domain/URL

- **Vercel**: Project settings → Domains → Add custom domain
- **Cloudflare**: Pages settings → Custom domains
- No code changes needed! Just DNS configuration

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env` file:
```bash
# Not currently used, but available for future features
EXPO_PUBLIC_API_URL=https://api.example.com
```

## 📊 Data Structure

All data is stored in AsyncStorage as JSON:

- **exercises**: Array of exercise definitions
- **prRecords**: Array of PR records with dates
- **preferences**: User preferences (units, theme, etc.)

Export format:
```json
{
  "version": "1.0.0",
  "exercises": [...],
  "prRecords": [...],
  "preferences": {...}
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Icons by [Ionicons](https://ionic.io/ionicons)
- Hosted on [Vercel](https://vercel.com)

## 💰 Support

If you find this app useful, consider supporting the development:

- [Ko-fi](https://ko-fi.com)
- [PayPal](https://paypal.me)

## 🚧 Roadmap

See [NEXT_STEPS.txt](NEXT_STEPS.txt) for planned features and future development.

## 📧 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

**Made with 💪 for the CrossFit community**
