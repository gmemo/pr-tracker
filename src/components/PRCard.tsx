import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../types';
import { calculatePlates, getBarWeight } from '../utils/plateCalculator';
import { usePR } from '../context/PRContext';

interface PRCardProps {
  exercise: Exercise;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function PRCard({ exercise, isExpanded, onToggle }: PRCardProps) {
  const { addPRRecord, theme } = usePR();
  const [customPercentage, setCustomPercentage] = useState('');
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null);
  const [selectedBarType, setSelectedBarType] = useState<string>(exercise.barType || 'standard');
  const [prModalVisible, setPRModalVisible] = useState(false);
  const [prFormData, setPRFormData] = useState({
    barType: exercise.barType || 'standard',
    platesWeight: '',
  });

  const percentages = [70, 80, 90];
  
  const barTypes = [
    { value: 'standard', label: '45lb', fullLabel: 'Estándar (45 lbs)', weight: 45 },
    { value: 'women', label: '35lb F', fullLabel: 'Mujeres (35 lbs)', weight: 35 },
    { value: 'training', label: '35lb E', fullLabel: 'Entrenamiento (35 lbs)', weight: 35 },
  ];
  
  const getIcon = () => {
    switch (exercise.category) {
      case 'barbell': return 'barbell';
      case 'dumbbell': return 'fitness';
      case 'bodyweight': return 'body';
      case 'cardio': return 'bicycle';
      default: return 'ellipse';
    }
  };

  const calculateWeight = (percentage: number) => {
    if (!exercise.currentPR) return 0;
    return Math.round((exercise.currentPR * percentage) / 100);
  };

  const calculatePlatesPerSide = (percentage: number) => {
    if (!exercise.currentPR) return 0;
    const totalWeight = calculateWeight(percentage);
    const barWeight = getBarWeight(selectedBarType, exercise.unit);
    const platesTotal = totalWeight - barWeight;
    return Math.round(platesTotal / 2);
  };

  const handlePercentageSelect = (percentage: number) => {
    setSelectedPercentage(percentage);
    setCustomPercentage('');
  };

  const handleCustomPercentage = () => {
    const percentage = parseInt(customPercentage);
    if (percentage > 0 && percentage <= 100) {
      setSelectedPercentage(percentage);
    }
  };

  const handleUpdatePR = () => {
    setPRFormData({
      barType: exercise.barType || 'standard',
      platesWeight: exercise.currentPRPlates?.toString() || '',
    });
    setPRModalVisible(true);
  };

  const handleSavePR = async () => {
    const platesWeight = parseFloat(prFormData.platesWeight);
    if (!isNaN(platesWeight) && platesWeight >= 0) {
      const barWeight = getBarWeight(prFormData.barType, exercise.unit);
      const totalWeight = barWeight + platesWeight;

      await addPRRecord({
        exerciseId: exercise.id,
        value: totalWeight,
        platesWeight: platesWeight,
        barType: prFormData.barType,
        date: new Date().toISOString(),
      });

      setPRModalVisible(false);
    } else {
      if (Platform.OS === 'web') {
        alert('❌ Ingresa un peso válido');
      } else {
        Alert.alert('Error', 'Ingresa un peso válido');
      }
    }
  };

  const renderWeightDisplay = () => {
    if (!selectedPercentage || !exercise.currentPR) return null;
    
    const platesPerSide = calculatePlatesPerSide(selectedPercentage);
    const barWeight = getBarWeight(selectedBarType, exercise.unit);
    
    return (
      <View style={[styles.plateCalculation, { backgroundColor: theme.surfaceLight }]}>
        <Text style={[styles.plateTitle, { color: theme.text }]}>
          {selectedPercentage}% = {calculateWeight(selectedPercentage)} lbs total
        </Text>
        <View style={styles.barSelector}>
          <Text style={[styles.barSelectorLabel, { color: theme.textSecondary }]}>Barra:</Text>
          {barTypes.map((bar) => (
            <TouchableOpacity
              key={bar.value}
              style={[
                styles.barOption,
                { backgroundColor: theme.surface, borderColor: theme.border },
                selectedBarType === bar.value && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setSelectedBarType(bar.value)}
            >
              <Text
                style={[
                  styles.barOptionText,
                  { color: theme.text },
                  selectedBarType === bar.value && { color: theme.background },
                ]}
              >
                {bar.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={[styles.platesDisplay, { backgroundColor: theme.primary }]}>
          <Text style={[styles.platesPerSideText, { color: theme.background }]}>
            {barWeight} lbs (barra) + {platesPerSide} lbs por lado
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name={getIcon()} size={24} color={theme.primary} />
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.text }]}>{exercise.name}</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                PR: {exercise.currentPR || '-'} {exercise.unit}
                {exercise.currentPRPlates && ` (${exercise.currentPRPlates} lbs en discos)`}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.textSecondary}
          />
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.percentageContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Porcentajes rápidos:</Text>
              <View style={styles.percentageButtons}>
                {percentages.map(percentage => (
                  <TouchableOpacity
                    key={percentage}
                    style={[
                      styles.percentageButton,
                      { backgroundColor: theme.surfaceLight, borderColor: theme.border },
                      selectedPercentage === percentage && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => handlePercentageSelect(percentage)}
                  >
                    <Text
                      style={[
                        styles.percentageButtonText,
                        { color: theme.text },
                        selectedPercentage === percentage && { color: theme.background },
                      ]}
                    >
                      {percentage}%
                    </Text>
                    {exercise.currentPR && (
                      <Text style={[
                        styles.percentageWeight,
                        { color: theme.textSecondary },
                        selectedPercentage === percentage && { color: theme.background }
                      ]}>
                        {calculateWeight(percentage)} lbs
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.customPercentageContainer}>
                <TextInput
                  style={[styles.customInput, { 
                    backgroundColor: theme.surfaceLight, 
                    color: theme.text,
                    borderColor: theme.border 
                  }]}
                  placeholder="Otro %"
                  placeholderTextColor={theme.textSecondary}
                  value={customPercentage}
                  onChangeText={setCustomPercentage}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <TouchableOpacity
                  style={[styles.customButton, { backgroundColor: theme.primary }]}
                  onPress={handleCustomPercentage}
                >
                  <Text style={[styles.customButtonText, { color: theme.background }]}>Calcular</Text>
                </TouchableOpacity>
              </View>
            </View>

            {renderWeightDisplay()}

            <TouchableOpacity 
              style={[styles.updateButton, { backgroundColor: theme.primary }]} 
              onPress={handleUpdatePR}
            >
              <Text style={[styles.updateButtonText, { color: theme.background }]}>Actualizar PR</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={prModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPRModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Nuevo PR - {exercise.name}</Text>
              <TouchableOpacity onPress={() => setPRModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.barRow}>
                <Text style={[styles.barRowLabel, { color: theme.text }]}>Barra:</Text>
                <View style={styles.barOptionsSimple}>
                  <TouchableOpacity
                    style={[
                      styles.barSimpleButton,
                      { backgroundColor: theme.surfaceLight, borderColor: theme.border },
                      (prFormData.barType === 'standard') && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setPRFormData({ ...prFormData, barType: 'standard' })}
                  >
                    <Text
                      style={[
                        styles.barSimpleText,
                        { color: theme.text },
                        (prFormData.barType === 'standard') && { color: theme.background },
                      ]}
                    >
                      45lb
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.barSimpleButton,
                      { backgroundColor: theme.surfaceLight, borderColor: theme.border },
                      (prFormData.barType === 'women' || prFormData.barType === 'training') && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setPRFormData({ ...prFormData, barType: 'women' })}
                  >
                    <Text
                      style={[
                        styles.barSimpleText,
                        { color: theme.text },
                        (prFormData.barType === 'women' || prFormData.barType === 'training') && { color: theme.background },
                      ]}
                    >
                      35lb
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Peso en discos (total):</Text>
                <TextInput
                  style={[styles.modalInput, {
                    backgroundColor: theme.surfaceLight,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  value={prFormData.platesWeight}
                  onChangeText={(text) => setPRFormData({ ...prFormData, platesWeight: text })}
                  placeholder="Ej: 90"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
                <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                  Total: {getBarWeight(prFormData.barType, exercise.unit)} lbs (barra) + {prFormData.platesWeight || '0'} lbs = {
                    (getBarWeight(prFormData.barType, exercise.unit) + (parseFloat(prFormData.platesWeight) || 0))
                  } lbs
                </Text>
              </View>

              {/* Buttons inside ScrollView */}
              <View style={styles.modalFooterInside}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => setPRModalVisible(false)}
                >
                  <Text style={[styles.modalButtonCancelText, { color: theme.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave, { backgroundColor: theme.primary }]}
                  onPress={handleSavePR}
                >
                  <Text style={[styles.modalButtonSaveText, { color: theme.background }]}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  expandedContent: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  percentageContainer: {
    marginBottom: 16,
  },
  percentageButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  percentageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  percentageButtonActive: {
  },
  percentageButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  percentageButtonTextActive: {
  },
  percentageWeight: {
    fontSize: 12,
    marginTop: 4,
  },
  customPercentageContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  customInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  customButton: {
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
  },
  customButtonText: {
    fontWeight: '600',
  },
  plateCalculation: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  plateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  barSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  barSelectorLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  barOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 48,
    alignItems: 'center',
  },
  barOptionActive: {
  },
  barOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  barOptionTextActive: {
    fontWeight: '600',
  },
  platesDisplay: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  platesPerSideText: {
    fontSize: 18,
    fontWeight: '600',
  },
  updateButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  modalFooterInside: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  barOptions: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  barRowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  barOptionsSimple: {
    flexDirection: 'row',
    gap: 8,
  },
  barSimpleButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    width: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barSimpleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonSave: {
  },
  modalButtonSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
});