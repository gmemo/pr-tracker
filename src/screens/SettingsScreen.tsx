import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePR } from '../context/PRContext';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

export default function SettingsScreen() {
  const {
    preferences,
    updatePreferences,
    theme,
    totalPRs,
    exportData,
    importData,
    setSyncFile,
  } = usePR();

  const [isSyncing, setIsSyncing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const themeOptions = [
    { value: 'green', label: '🟢 Verde', color: '#00D084' },
    { value: 'red', label: '🔴 Rojo', color: '#FF3B30' },
    { value: 'blue', label: '🔵 Azul', color: '#007AFF' },
    { value: 'pink', label: '🩷 Rosa', color: '#FF2D55' },
    { value: 'yellow', label: '🟡 Amarillo', color: '#FFCC00' },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportData();
      if (Platform.OS === 'web') {
        alert('✅ Datos exportados correctamente');
      } else {
        Alert.alert('Éxito', 'Datos exportados correctamente');
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('❌ Error: No se pudieron exportar los datos');
      } else {
        Alert.alert('Error', 'No se pudieron exportar los datos');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    const confirmImport = Platform.OS === 'web'
      ? window.confirm('⚠️ Importar datos\n\n¿Esto reemplazará todos tus datos actuales. Estás seguro?')
      : true;

    if (Platform.OS === 'web') {
      if (!confirmImport) return;

      try {
        setIsImporting(true);
        console.log('Starting import...');
        await importData();
        alert('✅ Datos importados correctamente');
      } catch (error: any) {
        // Don't show error if user just cancelled the file picker
        if (error?.message !== 'Import cancelled') {
          console.error('Import error:', error);
          alert('❌ Error: No se pudieron importar los datos\n\n' + (error?.message || 'Unknown error'));
        }
      } finally {
        setIsImporting(false);
      }
    } else {
      Alert.alert(
        'Importar datos',
        '¿Esto reemplazará todos tus datos actuales. Estás seguro?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Importar',
            onPress: async () => {
              try {
                setIsImporting(true);
                await importData();
                Alert.alert('Éxito', 'Datos importados correctamente');
              } catch (error: any) {
                if (error?.message !== 'Import cancelled') {
                  console.error('Import error:', error);
                  Alert.alert('Error', 'No se pudieron importar los datos: ' + (error?.message || 'Unknown error'));
                }
              } finally {
                setIsImporting(false);
              }
            },
          },
        ]
      );
    }
  };

  const handleSelectSyncFile = async () => {
    Alert.alert(
      'Configurar sincronización',
      'Elige una opción:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Crear archivo nuevo', 
          onPress: () => createNewSyncFile() 
        },
        { 
          text: 'Seleccionar existente', 
          onPress: () => selectExistingSyncFile() 
        },
      ]
    );
  };

  const createNewSyncFile = async () => {
    try {
      setIsSyncing(true);
      // Create a new file in the Documents directory
      const fileName = `pr-tracker-sync-${Date.now()}.json`;
      const filePath = FileSystem.documentDirectory + fileName;
      
      await setSyncFile(filePath);
      Alert.alert(
        'Éxito', 
        `Archivo creado: ${fileName}\n\nPuedes mover este archivo a iCloud, Google Drive, o cualquier servicio de nube para sincronizar entre dispositivos.`
      );
    } catch (error) {
      console.error('Error creating sync file:', error);
      Alert.alert('Error', 'No se pudo crear el archivo de sincronización');
    } finally {
      setIsSyncing(false);
    }
  };

  const selectExistingSyncFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Allow all file types
        copyToCacheDirectory: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsSyncing(true);
        await setSyncFile(result.assets[0].uri);
        Alert.alert(
          'Éxito', 
          'Archivo de sincronización configurado.\n\nSe ha creado una copia local del archivo que se mantendrá sincronizada. Puedes mover este archivo a iCloud, Google Drive, etc.'
        );
      }
    } catch (error) {
      console.error('Error selecting sync file:', error);
      Alert.alert('Error', 'No se pudo configurar el archivo de sincronización');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisableSync = async () => {
    Alert.alert(
      'Desactivar sincronización',
      '¿Volver al almacenamiento local únicamente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          onPress: async () => {
            try {
              setIsSyncing(true);
              await setSyncFile(null);
              Alert.alert('Éxito', 'Sincronización desactivada. Los datos ahora se guardan localmente.');
            } catch (error) {
              Alert.alert('Error', 'No se pudo desactivar la sincronización');
            } finally {
              setIsSyncing(false);
            }
          },
        },
      ]
    );
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => 
      Alert.alert('Error', 'No se pudo abrir el enlace')
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Datos y Sincronización */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📊 Datos y Sincronización
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.row} onPress={handleExport} disabled={isExporting}>
              <View style={styles.rowLeft}>
                <Ionicons name="download-outline" size={24} color={theme.primary} />
                <Text style={[styles.rowText, { color: theme.text }]}>Exportar datos</Text>
              </View>
              {isExporting ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.row} onPress={handleImport} disabled={isImporting}>
              <View style={styles.rowLeft}>
                <Ionicons name="cloud-upload-outline" size={24} color={theme.primary} />
                <Text style={[styles.rowText, { color: theme.text }]}>Importar datos</Text>
              </View>
              {isImporting ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>

            {/* Hide file sync on web - not supported in browsers */}
            {Platform.OS !== 'web' && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <TouchableOpacity
                  style={styles.row}
                  onPress={preferences.syncFilePath ? handleDisableSync : handleSelectSyncFile}
                  disabled={isSyncing}
                >
                  <View style={styles.rowLeft}>
                    <Ionicons
                      name={preferences.syncFilePath ? "cloud-done-outline" : "cloud-upload-outline"}
                      size={24}
                      color={theme.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.rowText, { color: theme.text }]}>
                        {preferences.syncFilePath ? 'Archivo de sincronización' : 'Configurar sincronización'}
                      </Text>
                      <Text style={[styles.rowSubtext, { color: theme.textSecondary }]}>
                        {preferences.syncFilePath
                          ? `Activa • ${preferences.lastSyncDate ? new Date(preferences.lastSyncDate).toLocaleDateString() : 'Sin sincronizar'}`
                          : 'Selecciona un archivo JSON para sincronización'
                        }
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Preferencias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            ⚙️ Preferencias
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Ionicons name="speedometer-outline" size={22} color={theme.primary} />
                <Text
                  style={[styles.settingRowText, { color: theme.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Unidad
                </Text>
              </View>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { borderColor: theme.border },
                    preferences.defaultUnit === 'lbs' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => updatePreferences({ defaultUnit: 'lbs' })}
                >
                  <Text style={[
                    styles.toggleText,
                    { color: preferences.defaultUnit === 'lbs' ? '#FFFFFF' : theme.text }
                  ]}>
                    lbs
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { borderColor: theme.border },
                    preferences.defaultUnit === 'kg' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => updatePreferences({ defaultUnit: 'kg' })}
                >
                  <Text style={[
                    styles.toggleText,
                    { color: preferences.defaultUnit === 'kg' ? '#FFFFFF' : theme.text }
                  ]}>
                    kg
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Ionicons name="barbell-outline" size={22} color={theme.primary} />
                <Text
                  style={[styles.settingRowText, { color: theme.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Barra
                </Text>
              </View>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { borderColor: theme.border },
                    preferences.defaultBarType === 'standard' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => updatePreferences({ defaultBarType: 'standard' })}
                >
                  <Text style={[
                    styles.toggleText,
                    { color: preferences.defaultBarType === 'standard' ? '#FFFFFF' : theme.text }
                  ]}>
                    {preferences.defaultUnit === 'kg' ? '20kg' : '45lb'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { borderColor: theme.border },
                    preferences.defaultBarType === 'women' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => updatePreferences({ defaultBarType: 'women' })}
                >
                  <Text style={[
                    styles.toggleText,
                    { color: preferences.defaultBarType === 'women' ? '#FFFFFF' : theme.text }
                  ]}>
                    {preferences.defaultUnit === 'kg' ? '15kg' : '35lb'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Ionicons name="contrast-outline" size={22} color={theme.primary} />
                <Text
                  style={[styles.settingRowText, { color: theme.text }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  Tema
                </Text>
              </View>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { borderColor: theme.border },
                    preferences.themeMode === 'dark' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => updatePreferences({ themeMode: 'dark' })}
                >
                  <Ionicons
                    name="moon"
                    size={16}
                    color={preferences.themeMode === 'dark' ? '#FFFFFF' : theme.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    { borderColor: theme.border },
                    preferences.themeMode === 'light' && { backgroundColor: theme.primary }
                  ]}
                  onPress={() => updatePreferences({ themeMode: 'light' })}
                >
                  <Ionicons
                    name="sunny"
                    size={16}
                    color={preferences.themeMode === 'light' ? '#FFFFFF' : theme.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.colorSection}>
              <View style={styles.rowLeft}>
                <Ionicons name="color-palette-outline" size={24} color={theme.primary} />
                <Text style={[styles.rowText, { color: theme.text }]}>Color del tema</Text>
              </View>
              <View style={styles.colorOptions}>
                {themeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.colorButton,
                      { backgroundColor: option.color },
                      preferences.themeColor === option.value && styles.colorButtonActive,
                    ]}
                    onPress={() => updatePreferences({ themeColor: option.value as any })}
                  >
                    {preferences.themeColor === option.value && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Acerca de */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            💪 Acerca de
          </Text>
          
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.statsContainer}>
              <Text style={[styles.statsText, { color: theme.primary }]}>
                Has registrado {totalPRs} PRs 🎉
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            
            <View style={styles.aboutContent}>
              <Text style={[styles.aboutText, { color: theme.text }]}>
                Hey! 👋 Soy un crossfitter como tú. Creé esta app porque me cansé de anotar mis PRs en notas o tratar de recordarlos en medio del WOD.
              </Text>
              
              <Text style={[styles.aboutText, { color: theme.text }]}>
                La hice simple y sin internet porque sé que en el box el wifi nunca funciona 😅
              </Text>
              
              <Text style={[styles.aboutText, { color: theme.text }]}>
                Si te está siendo útil y quieres invitarme un café (o un batido de proteína), te lo agradecería mucho!
              </Text>
              
              <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
                PD: Si tu box quiere patrocinar la app, podemos agregar una mención especial ✨
              </Text>
            </View>
            
            <View style={styles.donationButtons}>
              <TouchableOpacity 
                style={[styles.donationButton, { backgroundColor: '#FF5E5B' }]}
                onPress={() => openLink('https://ko-fi.com/tuusuario')}
              >
                <Ionicons name="heart" size={20} color="#FFFFFF" />
                <Text style={styles.donationButtonText}>Apoyar en Ko-fi</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.donationButton, { backgroundColor: '#0070BA' }]}
                onPress={() => openLink('https://paypal.me/tuusuario')}
              >
                <Ionicons name="logo-paypal" size={20} color="#FFFFFF" />
                <Text style={styles.donationButtonText}>Donar por PayPal</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={[styles.rateButton, { borderColor: theme.primary }]}
              onPress={() => openLink('https://apps.apple.com/app/idXXXXXXXXX')}
            >
              <Ionicons name="star" size={20} color={theme.primary} />
              <Text style={[styles.rateButtonText, { color: theme.primary }]}>
                Calificar en App Store
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coming Soon */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🚀 Próximamente
          </Text>

          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.comingSoonContent}>
              <Text style={[styles.comingSoonIntro, { color: theme.textSecondary }]}>
                Funciones en las que estoy trabajando:
              </Text>

              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🏋️</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Entrenamientos</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Crea WODs personalizados usando tus PRs (ej: "Back Squat 5x5 @ 70%")
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>⏱️</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Cronómetro inteligente</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Timer para descansos, EMOM, AMRAP, Tabata y más
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📸</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Compartir entrenamientos</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Screenshot automático de tu WOD con pesos y tiempos para redes sociales
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📅</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Calendario de entrenamientos</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Vista de calendario con tus WODs y PRs por fecha
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🎯</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Logros y metas</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Badges, racha de entrenamientos, y objetivos personalizados
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📝</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Notas de entrenamiento</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Agrega comentarios, cómo te sentiste, y observaciones en cada sesión
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>☁️</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Respaldo automático</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Sync con la nube (iCloud/Google Drive) y backups automáticos periódicos
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🌐</Text>
                  <View style={styles.featureText}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>Idiomas</Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      Soporte para inglés, portugués y más idiomas
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.comingSoonFooter, { color: theme.textSecondary }]}>
                💡 Si te gustaría ver alguna de estas features pronto, apóyame con un café ☕
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy & Version - At the very bottom */}
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.legalText, { color: theme.textSecondary }]}>
              Tus datos son 100% tuyos. No se suben a ningún servidor. No hay tracking ni anuncios.
            </Text>
          </View>

          <Text style={[styles.versionText, { color: theme.textSecondary }]}>
            Versión 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
    marginRight: 12,
    minWidth: 0,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingRowText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    minWidth: 0,
  },
  rowSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 6,
    flexShrink: 0,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  colorSection: {
    padding: 16,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  statsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statsText: {
    fontSize: 18,
    fontWeight: '600',
  },
  aboutContent: {
    padding: 16,
    gap: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  donationButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  donationButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  donationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  rateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  legalText: {
    fontSize: 12,
    padding: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  comingSoonContent: {
    padding: 16,
  },
  comingSoonIntro: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  comingSoonFooter: {
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});