import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRProvider, usePR } from './src/context/PRContext';
import PRListScreen from './src/screens/PRListScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import CustomHeader from './src/components/CustomHeader';

const Tab = createBottomTabNavigator();

function AppContent() {
  const { theme } = usePR();
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);

  // Check if this is the first launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setShowWelcome(true);
        } else {
          setShowWelcome(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setShowWelcome(false);
      }
    };
    checkFirstLaunch();
  }, []);

  // Update meta theme-color for web/PWA
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        // Update theme-color meta tag
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', theme.surface);
          console.log('✅ Updated theme-color to:', theme.surface);
        } else {
          // Create if doesn't exist
          metaThemeColor = document.createElement('meta');
          metaThemeColor.name = 'theme-color';
          metaThemeColor.content = theme.surface;
          document.head.appendChild(metaThemeColor);
          console.log('✅ Created theme-color meta tag:', theme.surface);
        }

        // Update iOS status bar style
        let metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        const statusBarStyle = theme.mode === 'dark' ? 'black-translucent' : 'default';
        if (metaStatusBar) {
          metaStatusBar.setAttribute('content', statusBarStyle);
        } else {
          metaStatusBar = document.createElement('meta');
          metaStatusBar.name = 'apple-mobile-web-app-status-bar-style';
          metaStatusBar.content = statusBarStyle;
          document.head.appendChild(metaStatusBar);
        }
        console.log('✅ iOS status bar style:', statusBarStyle);

        // Force Safari to repaint by touching body
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [theme.surface, theme.mode]);

  const handleWelcomeComplete = async () => {
    try {
      await AsyncStorage.setItem('hasLaunched', 'true');
      setShowWelcome(false);
    } catch (error) {
      console.error('Error saving first launch:', error);
    }
  };

  // Show nothing while checking
  if (showWelcome === null) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  // Show welcome screen on first launch
  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <NavigationContainer
      documentTitle={{
        formatter: () => 'PR Tracker - CrossFit'
      }}
    >
      <StatusBar style={theme.statusBar} />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
            borderTopWidth: 1,
            paddingBottom: Platform.OS === 'web' ? 8 : 20,
            paddingTop: 8,
            height: Platform.OS === 'web' ? 60 : 75,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarShowLabel: false, // Hide text labels - icons only!
          tabBarIconStyle: {
            marginTop: 0,
          },
          headerStyle: {
            backgroundColor: theme.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 24,
          },
        }}
      >
        <Tab.Screen
          name="PRs"
          component={PRListScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size} color={color} />
            ),
            header: () => (
              <CustomHeader
                title="Mis PRs"
                icon="trophy"
                subtitle="Tus mejores marcas"
              />
            ),
          }}
        />
        <Tab.Screen
          name="Exercises"
          component={ExercisesScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="barbell" size={size} color={color} />
            ),
            header: () => (
              <CustomHeader
                title="Ejercicios"
                icon="barbell"
                subtitle="Administra tu catálogo"
              />
            ),
          }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
            header: () => (
              <CustomHeader
                title="Histórico"
                icon="trending-up"
                subtitle="Tu progreso en el tiempo"
              />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
            header: () => (
              <CustomHeader
                title="Configuración"
                icon="settings"
                subtitle="Personaliza tu app"
              />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PRProvider>
        <AppContent />
      </PRProvider>
    </SafeAreaProvider>
  );
}