import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePR } from '../context/PRContext';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { theme } = usePR();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with Icon */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="barbell" size={64} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Bienvenido a PR Tracker
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Tu registro personal de CrossFit, 100% offline
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={styles.features}>
          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.featureIconBadge, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="shield-checkmark" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Sin cuenta, sin login
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              No necesitas crear una cuenta ni iniciar sesión. La app funciona completamente offline en tu dispositivo.
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.featureIconBadge, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="lock-closed" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Tus datos son 100% tuyos
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Todo se guarda localmente en tu teléfono. No hay servidores, no hay tracking, no hay anuncios. Privacidad total.
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.featureIconBadge, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="cloud-download" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Importa/Exporta cuando quieras
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Crea respaldos de tus datos en formato JSON. Impórtalos en cualquier momento para recuperar tu información.
            </Text>
          </View>

          <View style={[styles.featureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.featureIconBadge, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="wifi-outline" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              Funciona sin internet
            </Text>
            <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
              Perfecto para el box donde el wifi nunca funciona. Registra tus PRs sin conexión.
            </Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={24} color={theme.primary} />
            <Text style={[styles.tipTitle, { color: theme.text }]}>Consejo importante</Text>
          </View>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            Explora la sección de <Text style={[styles.tipBold, { color: theme.primary }]}>Configuración</Text> para personalizar la app, exportar tus datos, y descubrir las funciones que vienen pronto.
          </Text>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: theme.primary }]}
          onPress={onComplete}
          activeOpacity={0.8}
        >
          <Text style={[styles.startButtonText, { color: theme.background }]}>
            Comenzar
          </Text>
          <Ionicons name="arrow-forward" size={20} color={theme.background} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  features: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  featureIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 24,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipBold: {
    fontWeight: '700',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
