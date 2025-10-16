import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { Exercise, PRRecord, UserPreferences, AppData } from '../types';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

interface PRContextType {
  exercises: Exercise[];
  prRecords: PRRecord[];
  preferences: UserPreferences;
  theme: any;
  totalPRs: number;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<Exercise>;
  updateExercise: (id: string, exercise: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  addPRRecord: (record: Omit<PRRecord, 'id'>) => Promise<void>;
  getExerciseHistory: (exerciseId: string) => PRRecord[];
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  exportData: () => Promise<void>;
  importData: () => Promise<void>;
  setSyncFile: (filePath: string | null) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  defaultUnit: 'lbs',
  defaultBarType: 'standard',
  themeColor: 'green',
  themeMode: 'dark',
  syncFilePath: undefined, // undefined = local AsyncStorage only
};

const PRContext = createContext<PRContextType | undefined>(undefined);

export const PRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [prRecords, setPRRecords] = useState<PRRecord[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [totalPRs, setTotalPRs] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Calculate total PRs whenever records change
    setTotalPRs(prRecords.length);
  }, [prRecords]);

  const loadData = async () => {
    try {
      // First load preferences from AsyncStorage to get sync path
      const prefsData = await AsyncStorage.getItem('preferences');
      const currentPrefs = prefsData ? { ...defaultPreferences, ...JSON.parse(prefsData) } : defaultPreferences;
      
      if (currentPrefs.syncFilePath) {
        // Load from sync file - this becomes the single source of truth
        console.log(`📂 Loading from sync file: ${currentPrefs.syncFilePath}`);
        await loadFromSyncFile(currentPrefs.syncFilePath);
      } else {
        // Load from local AsyncStorage
        console.log('📱 Loading from local storage');
        setPreferences(currentPrefs);
        const exercisesData = await AsyncStorage.getItem('exercises');
        const recordsData = await AsyncStorage.getItem('prRecords');
        
        if (exercisesData) setExercises(JSON.parse(exercisesData));
        if (recordsData) setPRRecords(JSON.parse(recordsData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveExercises = async (newExercises: Exercise[]) => {
    try {
      setExercises(newExercises);
      
      if (preferences.syncFilePath) {
        // Save to sync file with new exercises data
        await saveToSyncFile(preferences.syncFilePath, { exercises: newExercises });
      } else {
        // Save to local AsyncStorage
        await AsyncStorage.setItem('exercises', JSON.stringify(newExercises));
      }
    } catch (error) {
      console.error('Error saving exercises:', error);
    }
  };

  const savePRRecords = async (newRecords: PRRecord[]) => {
    try {
      setPRRecords(newRecords);
      
      if (preferences.syncFilePath) {
        // Save to sync file with new records data
        await saveToSyncFile(preferences.syncFilePath, { prRecords: newRecords });
      } else {
        // Save to local AsyncStorage
        await AsyncStorage.setItem('prRecords', JSON.stringify(newRecords));
      }
    } catch (error) {
      console.error('Error saving PR records:', error);
    }
  };

  const loadFromSyncFile = async (filePath: string) => {
    try {
      const jsonData = await FileSystem.readAsStringAsync(filePath);
      const appData: AppData = JSON.parse(jsonData);
      
      if (appData.exercises) setExercises(appData.exercises);
      if (appData.prRecords) setPRRecords(appData.prRecords);
      
      // IMPORTANT: Always preserve the sync file path when loading from sync file
      if (appData.preferences) {
        const syncPrefs = { 
          ...defaultPreferences, 
          ...appData.preferences, 
          syncFilePath: filePath // Force the current file path
        };
        setPreferences(syncPrefs);
        // Also update AsyncStorage to remember this sync file
        await AsyncStorage.setItem('preferences', JSON.stringify(syncPrefs));
      } else {
        // If no preferences in file, create them with sync path
        const syncPrefs = { 
          ...defaultPreferences, 
          syncFilePath: filePath 
        };
        setPreferences(syncPrefs);
        await AsyncStorage.setItem('preferences', JSON.stringify(syncPrefs));
      }
      
      console.log(`✅ Loaded from sync file: ${appData.exercises?.length || 0} exercises, ${appData.prRecords?.length || 0} PRs`);
    } catch (error) {
      console.error('Error loading from sync file:', error);
      // Fall back to local storage if sync file fails
      const exercisesData = await AsyncStorage.getItem('exercises');
      const recordsData = await AsyncStorage.getItem('prRecords');
      const prefsData = await AsyncStorage.getItem('preferences');
      
      if (exercisesData) setExercises(JSON.parse(exercisesData));
      if (recordsData) setPRRecords(JSON.parse(recordsData));
      if (prefsData) setPreferences(JSON.parse(prefsData));
    }
  };

  const saveToSyncFile = async (filePath: string, customData?: { exercises?: Exercise[], prRecords?: PRRecord[], preferences?: UserPreferences }) => {
    try {
      const currentExercises = customData?.exercises || exercises;
      const currentRecords = customData?.prRecords || prRecords;
      const currentPrefs = customData?.preferences || preferences;
      
      const appData: AppData = {
        version: '1.0.0',
        lastSync: new Date().toISOString(),
        exercises: currentExercises,
        prRecords: currentRecords,
        preferences: currentPrefs,
        stats: {
          totalPRs: currentRecords.length,
          lastPRDate: currentRecords.length > 0 
            ? currentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
            : undefined,
        },
      };

      const jsonData = JSON.stringify(appData, null, 2);
      await FileSystem.writeAsStringAsync(filePath, jsonData);
      
      console.log(`✅ Saved to sync file: ${filePath}`);
      console.log(`📊 Data: ${currentExercises.length} exercises, ${currentRecords.length} PRs`);
    } catch (error) {
      console.error('Error saving to sync file:', error);
      throw error;
    }
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const newPrefs = { ...preferences, ...prefs };
      await AsyncStorage.setItem('preferences', JSON.stringify(newPrefs));
      setPreferences(newPrefs);
      
      // If sync path changed, save current data to new location
      if (prefs.syncFilePath !== undefined && prefs.syncFilePath !== preferences.syncFilePath) {
        if (prefs.syncFilePath) {
          console.log(`🔄 Switching sync file to: ${prefs.syncFilePath}`);
          await saveToSyncFile(prefs.syncFilePath, { preferences: newPrefs });
        }
      } else if (preferences.syncFilePath && prefs.syncFilePath !== null) {
        // If we have an existing sync file and preferences changed, update it
        console.log(`💾 Updating sync file: ${preferences.syncFilePath}`);
        await saveToSyncFile(preferences.syncFilePath, { preferences: newPrefs });
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const addExercise = async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
    };
    await saveExercises([...exercises, newExercise]);
    return newExercise;
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    const updatedExercises = exercises.map(ex =>
      ex.id === id ? { ...ex, ...updates } : ex
    );
    await saveExercises(updatedExercises);
  };

  const deleteExercise = async (id: string) => {
    await saveExercises(exercises.filter(ex => ex.id !== id));
    await savePRRecords(prRecords.filter(pr => pr.exerciseId !== id));
  };

  const addPRRecord = async (record: Omit<PRRecord, 'id'>) => {
    const newRecord: PRRecord = {
      ...record,
      id: Date.now().toString(),
    };
    const newRecords = [...prRecords, newRecord];
    
    // Update exercise current PR if this is a new best
    const exercise = exercises.find(ex => ex.id === record.exerciseId);
    let newExercises = exercises;
    if (exercise && (!exercise.currentPR || record.value > exercise.currentPR)) {
      newExercises = exercises.map(ex =>
        ex.id === record.exerciseId ? { 
          ...ex, 
          currentPR: record.value,
          currentPRPlates: record.platesWeight 
        } : ex
      );
    }
    
    // Save both changes together
    setExercises(newExercises);
    setPRRecords(newRecords);
    
    if (preferences.syncFilePath) {
      // Save both exercises and records to sync file in one operation
      await saveToSyncFile(preferences.syncFilePath, { 
        exercises: newExercises, 
        prRecords: newRecords 
      });
    } else {
      // Save to local AsyncStorage
      await AsyncStorage.setItem('exercises', JSON.stringify(newExercises));
      await AsyncStorage.setItem('prRecords', JSON.stringify(newRecords));
    }
  };

  const getExerciseHistory = (exerciseId: string) => {
    return prRecords
      .filter(pr => pr.exerciseId === exerciseId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const exportData = async () => {
    try {
      const appData: AppData = {
        version: '1.0.0',
        lastSync: new Date().toISOString(),
        exercises,
        prRecords,
        preferences,
        stats: {
          totalPRs,
          lastPRDate: prRecords.length > 0
            ? prRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
            : undefined,
        },
      };

      const jsonData = JSON.stringify(appData, null, 2);

      if (Platform.OS === 'web') {
        // Web implementation: create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pr-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Native implementation: use file system and sharing
        const fileUri = FileSystem.documentDirectory + 'pr-tracker-backup.json';
        await FileSystem.writeAsStringAsync(fileUri, jsonData);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: 'Exportar datos de PR Tracker',
          });
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  const importData = async () => {
    if (Platform.OS === 'web') {
      // Web implementation: create file input and read file
      return new Promise<void>((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';

        let fileSelected = false;

        input.onchange = async (e: any) => {
          fileSelected = true;
          try {
            const file = e.target?.files?.[0];
            if (!file) {
              console.error('❌ No file in event');
              reject(new Error('No file selected'));
              return;
            }

            console.log('📁 File selected:', file.name);

            const reader = new FileReader();

            reader.onload = async (event) => {
              try {
                const jsonData = event.target?.result as string;
                console.log('📥 Importing data from file...');
                console.log('📄 File content length:', jsonData.length);

                // Validate JSON format
                let appData: AppData;
                try {
                  appData = JSON.parse(jsonData);
                  console.log('✅ JSON parsed successfully');
                } catch (parseError) {
                  throw new Error('Archivo JSON inválido. Asegúrate de seleccionar un archivo de respaldo válido.');
                }

                // Validate data structure
                if (!appData || typeof appData !== 'object') {
                  throw new Error('Formato de datos inválido');
                }

                if (!appData.version) {
                  throw new Error('Archivo de respaldo inválido: falta el número de versión');
                }

                if (!Array.isArray(appData.exercises)) {
                  throw new Error('Archivo de respaldo inválido: datos de ejercicios corruptos');
                }

                if (!Array.isArray(appData.prRecords)) {
                  throw new Error('Archivo de respaldo inválido: datos de PRs corruptos');
                }

                // Validate exercises structure
                const invalidExercise = appData.exercises.find(ex =>
                  !ex.id || !ex.name || !ex.category || !ex.unit
                );
                if (invalidExercise) {
                  throw new Error('Datos de ejercicios corruptos. Verifica el archivo de respaldo.');
                }

                // Validate PR records structure
                const invalidRecord = appData.prRecords.find(pr =>
                  !pr.id || !pr.exerciseId || typeof pr.value !== 'number' || !pr.date
                );
                if (invalidRecord) {
                  throw new Error('Datos de PRs corruptos. Verifica el archivo de respaldo.');
                }

                console.log(`📊 Importing ${appData.exercises.length} exercises and ${appData.prRecords.length} PR records`);

                // Save data
                setExercises(appData.exercises);
                setPRRecords(appData.prRecords);

                // Save to AsyncStorage
                await AsyncStorage.setItem('exercises', JSON.stringify(appData.exercises));
                await AsyncStorage.setItem('prRecords', JSON.stringify(appData.prRecords));

                if (appData.preferences) {
                  // Don't import syncFilePath on web
                  const { syncFilePath, lastSyncDate, ...webPrefs } = appData.preferences;
                  setPreferences({ ...preferences, ...webPrefs });
                  await AsyncStorage.setItem('preferences', JSON.stringify({ ...preferences, ...webPrefs }));
                }

                console.log('✅ Import successful! Data saved to state and AsyncStorage');
                resolve();
              } catch (error: any) {
                console.error('❌ Error parsing/saving data:', error);
                reject(error);
              }
            };

            reader.onerror = () => {
              console.error('❌ Error reading file');
              reject(new Error('Error reading file'));
            };

            console.log('📖 Starting to read file...');
            reader.readAsText(file);
          } catch (error) {
            console.error('❌ Error in file picker:', error);
            reject(error);
          }
        };

        // Handle cancellation - wait reasonable time for user to pick file
        const cancelTimeout = setTimeout(() => {
          if (!fileSelected) {
            console.log('⚠️ Import cancelled by user (no file selected)');
            reject(new Error('Import cancelled'));
          }
        }, 60000); // 60 seconds - if no file picked, assume cancelled

        // Also handle when dialog is closed/cancelled
        window.addEventListener('focus', () => {
          setTimeout(() => {
            if (!fileSelected) {
              clearTimeout(cancelTimeout);
              console.log('⚠️ File picker closed without selection');
              reject(new Error('Import cancelled'));
            }
          }, 300);
        }, { once: true });

        console.log('🖱️ Opening file picker...');
        input.click();
      });
    } else {
      // Native implementation: use document picker
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/json',
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const jsonData = await FileSystem.readAsStringAsync(result.assets[0].uri);
          const appData: AppData = JSON.parse(jsonData);

          // Validate data structure
          if (appData.version && appData.exercises && appData.prRecords) {
            await saveExercises(appData.exercises);
            await savePRRecords(appData.prRecords);
            if (appData.preferences) {
              await updatePreferences(appData.preferences);
            }
          } else {
            throw new Error('Invalid data format');
          }
        }
      } catch (error) {
        console.error('Error importing data:', error);
        throw error;
      }
    }
  };

  const setSyncFile = async (filePath: string | null) => {
    try {
      if (filePath) {
        let writableFilePath = filePath;
        
        // If the file is from a cloud picker, copy it to our documents directory
        if (filePath.includes('com.apple.') || filePath.includes('content://') || !filePath.startsWith(FileSystem.documentDirectory || '')) {
          // Create a writable copy in our app's documents directory
          const fileName = `pr-tracker-sync-${Date.now()}.json`;
          writableFilePath = FileSystem.documentDirectory + fileName;
          
          try {
            // Try to read the selected file and copy its contents
            const existingData = await FileSystem.readAsStringAsync(filePath);
            await FileSystem.writeAsStringAsync(writableFilePath, existingData);
            
            // Parse and apply the imported data
            const appData: AppData = JSON.parse(existingData);
            if (appData.exercises) setExercises(appData.exercises);
            if (appData.prRecords) setPRRecords(appData.prRecords);
          } catch (readError) {
            // If we can't read the file, just create a new one with current data
            console.log('Could not read selected file, creating new sync file with current data');
          }
        }
        
        // Save current data to the writable sync file location
        await saveToSyncFile(writableFilePath);
        
        // Update preferences with the writable path
        await updatePreferences({ syncFilePath: writableFilePath });
      } else {
        // Disable sync
        await updatePreferences({ syncFilePath: undefined });
      }
    } catch (error) {
      console.error('Error setting sync file:', error);
      throw error;
    }
  };

  const theme = getThemeColors(preferences.themeColor, preferences.themeMode);

  return (
    <PRContext.Provider
      value={{
        exercises,
        prRecords,
        preferences,
        theme,
        totalPRs,
        addExercise,
        updateExercise,
        deleteExercise,
        addPRRecord,
        getExerciseHistory,
        updatePreferences,
        exportData,
        importData,
        setSyncFile,
      }}
    >
      {children}
    </PRContext.Provider>
  );
};

export const usePR = () => {
  const context = useContext(PRContext);
  if (!context) {
    throw new Error('usePR must be used within a PRProvider');
  }
  return context;
};

// Import the getThemeColors function
import { getThemeColors } from '../theme';

// src/utils/plateCalculator.ts
import { PlateCalculation } from '../types';

const PLATE_WEIGHTS_LBS = [45, 35, 25, 10, 5, 2.5];
const PLATE_WEIGHTS_KG = [20, 15, 10, 5, 2.5, 1.25];

export const calculatePlates = (
  totalWeight: number,
  barWeight: number,
  unit: 'kg' | 'lbs'
): PlateCalculation => {
  const plateWeight = totalWeight - barWeight;
  const weightPerSide = plateWeight / 2;
  
  const availablePlates = unit === 'lbs' ? PLATE_WEIGHTS_LBS : PLATE_WEIGHTS_KG;
  const platesPerSide: { [key: string]: number } = {};
  
  let remainingWeight = weightPerSide;
  
  for (const plate of availablePlates) {
    const count = Math.floor(remainingWeight / plate);
    if (count > 0) {
      platesPerSide[plate.toString()] = count;
      remainingWeight -= count * plate;
    }
  }
  
  return {
    totalWeight,
    barWeight,
    plateWeight,
    platesPerSide,
  };
};

export const getBarWeight = (barType: string, unit: 'kg' | 'lbs'): number => {
  const weights = {
    standard: { kg: 20, lbs: 45 },
    women: { kg: 15, lbs: 35 },
    training: { kg: 15, lbs: 35 },
    none: { kg: 0, lbs: 0 },
  };
  
  return weights[barType as keyof typeof weights]?.[unit] || 0;
};