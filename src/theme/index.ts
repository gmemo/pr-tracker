const darkColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  surfaceLight: '#252525',
  danger: '#FF3B30',
  warning: '#FF9500',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#2C2C2E',
  statusBar: 'light' as const,
};

const lightColors = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceLight: '#E5E5EA',
  danger: '#FF3B30',
  warning: '#FF9500',
  text: '#000000',
  textSecondary: '#6E6E73',
  border: '#D1D1D6',
  statusBar: 'dark' as const,
};

export const themeColors = {
  green: {
    primary: '#00D084',
    primaryDark: '#00A066',
    primaryLight: '#00F096',
  },
  red: {
    primary: '#FF3B30',
    primaryDark: '#D70015',
    primaryLight: '#FF6259',
  },
  blue: {
    primary: '#007AFF',
    primaryDark: '#0051D5',
    primaryLight: '#4DA3FF',
  },
  pink: {
    primary: '#FF2D55',
    primaryDark: '#D30036',
    primaryLight: '#FF6B8A',
  },
  yellow: {
    primary: '#FFCC00',
    primaryDark: '#D4A000',
    primaryLight: '#FFD633',
  },
};

export const getThemeColors = (
  themeColor: 'green' | 'red' | 'blue' | 'pink' | 'yellow',
  themeMode: 'dark' | 'light' = 'dark'
) => {
  const baseColors = themeMode === 'dark' ? darkColors : lightColors;
  return {
    ...baseColors,
    ...themeColors[themeColor],
    mode: themeMode,
  };
};

// Legacy export for backwards compatibility
export const colors = darkColors;
