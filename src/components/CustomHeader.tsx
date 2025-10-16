import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePR } from '../context/PRContext';

interface CustomHeaderProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  subtitle?: string;
}

export default function CustomHeader({ title, icon, subtitle }: CustomHeaderProps) {
  const { theme } = usePR();

  useEffect(() => {
    console.log('CustomHeader rendered:', title);
  }, [title]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.surface }]}>
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: theme.mode === 'dark' ? theme.primary + '20' : theme.primary + '15',
                },
              ]}
            >
              <Ionicons name={icon} size={28} color={theme.primary} />
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
          </View>
        </View>
        <View style={[styles.bottomBorder, { backgroundColor: theme.primary, opacity: 0.3 }]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
  },
  container: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  bottomBorder: {
    height: 2,
    marginTop: 12,
    borderRadius: 1,
  },
});
