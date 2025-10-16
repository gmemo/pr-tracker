export interface Exercise {
  id: string;
  name: string;
  category: 'barbell' | 'dumbbell' | 'bodyweight' | 'cardio' | 'other';
  barType?: 'standard' | 'women' | 'training' | 'none';
  barWeight?: number;
  currentPR?: number;
  currentPRPlates?: number; // Peso de discos sin contar la barra
  unit: 'kg' | 'lbs' | 'reps' | 'time';
  notes?: string;
}

export interface PRRecord {
  id: string;
  exerciseId: string;
  value: number; // Peso total (barra + discos)
  platesWeight?: number; // Peso solo de discos
  barType?: string; // Tipo de barra usado en este PR
  date: string;
  notes?: string;
}

export interface PlateCalculation {
  totalWeight: number;
  barWeight: number;
  plateWeight: number;
  platesPerSide: {
    [key: string]: number;
  };
}

export interface UserPreferences {
  defaultUnit: 'kg' | 'lbs';
  defaultBarType: 'standard' | 'women' | 'training';
  themeColor: 'green' | 'red' | 'blue' | 'pink' | 'yellow';
  themeMode: 'dark' | 'light';
  syncFilePath?: string; // Custom file path for sync (null = local only)
  lastSyncDate?: string;
}

export interface AppData {
  version: string;
  lastSync: string;
  exercises: Exercise[];
  prRecords: PRRecord[];
  preferences: UserPreferences;
  stats: {
    totalPRs: number;
    lastPRDate?: string;
  };
}
