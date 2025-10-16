# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native CrossFit PR (Personal Record) tracker app built with Expo. The app allows users to track their personal records for various CrossFit exercises, calculate plate loading for barbells, and manage their fitness data with export/import functionality.

## Key Technologies

- **React Native + Expo**: Mobile app framework
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Bottom tab navigation
- **AsyncStorage**: Local data persistence
- **Context API**: Global state management via PRContext
- **Expo File System**: For data export/import functionality

## Common Commands

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android emulator/device
npm run ios           # Run on iOS simulator/device
npm run web           # Run in web browser

# No build, lint, or test scripts are currently configured
```

## Core Architecture

### State Management
- **PRContext** (`src/context/PRContext.tsx`) - Central state management using React Context
- Manages exercises, PR records, user preferences, and app theme
- Handles data persistence via AsyncStorage
- Provides export/import functionality for backup/restore

### Data Models
- **Exercise**: Represents workout exercises with categories, bar types, and current PRs
- **PRRecord**: Individual PR entries with weight, date, and plate calculations
- **UserPreferences**: App settings including units, theme, and sync preferences
- **PlateCalculation**: Utility for calculating barbell plate loading

### Navigation Structure
- Bottom tab navigation with 4 main screens:
  - **PRs**: Main PR list and management
  - **Exercises**: Exercise library and configuration
  - **History**: Historical PR data and progress charts
  - **Settings**: App preferences and data management

### Theme System
- Dark theme with customizable primary colors (green, red, blue, pink, yellow)
- Theme colors defined in `src/theme/index.ts`
- Dynamic theme switching via user preferences

### Key Features
- **Plate Calculator**: Automatically calculates barbell plate loading based on weight and bar type
- **Data Export/Import**: JSON-based backup system using Expo FileSystem
- **Multi-unit Support**: Handles both kg and lbs measurements
- **iCloud Sync**: Placeholder implementation for future cloud sync functionality

## Code Conventions

- Uses TypeScript with strict mode enabled
- React functional components with hooks
- Expo SDK ~53.0.13 with React Native 0.79.4
- Spanish UI text (titles like "Mis PRs", "Ejercicios", etc.)
- AsyncStorage for data persistence
- Context providers for global state

## File Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React Context providers
├── screens/       # Main app screens
├── theme/         # Theme configuration
├── types/         # TypeScript type definitions
└── utils/         # Utility functions (plate calculator)
```

## Development Notes

- The app uses Expo managed workflow
- All data is stored locally using AsyncStorage
- The plate calculator supports standard (45lb/20kg), women's (35lb/15kg), and training bars
- iCloud sync is planned but not fully implemented
- The app is designed primarily for portrait orientation
- Bundle identifiers are set for both iOS and Android deployment