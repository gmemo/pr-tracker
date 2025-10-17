import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePR } from '../context/PRContext';
import { Exercise } from '../types';
import { getBarWeight } from '../utils/plateCalculator';

export default function ExercisesScreen() {
  const { exercises, addExercise, updateExercise, deleteExercise, addPRRecord, theme, preferences } = usePR();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'barbell' as Exercise['category'],
    barType: preferences.defaultBarType as Exercise['barType'],
    unit: preferences.defaultUnit as Exercise['unit'],
    currentPR: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    currentPR: '',
  });

  const categories = [
    { value: 'barbell', label: 'Barra', icon: 'barbell' },
    { value: 'dumbbell', label: 'Mancuerna', icon: 'fitness' },
    { value: 'bodyweight', label: 'Peso corporal', icon: 'body' },
    { value: 'cardio', label: 'Cardio', icon: 'bicycle' },
    { value: 'other', label: 'Otro', icon: 'ellipse' },
  ];

  const barTypes = [
    { value: 'standard', label: '45 lb', fullLabel: 'Estándar (45 lbs)' },
    { value: 'women', label: '35 lb', fullLabel: 'Mujeres (35 lbs)' },
  ];

  const units = [
    { value: 'lbs', label: 'Libras (lbs)' },
    { value: 'kg', label: 'Kilogramos (kg)' },
    { value: 'reps', label: 'Repeticiones' },
    { value: 'time', label: 'Tiempo' },
  ];

  const handleOpenModal = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({
        name: exercise.name,
        category: exercise.category,
        barType: exercise.barType || 'standard',
        unit: exercise.unit,
        currentPR: exercise.currentPR?.toString() || '',
      });
    } else {
      setEditingExercise(null);
      setFormData({
        name: '',
        category: 'barbell',
        barType: preferences.defaultBarType,
        unit: preferences.defaultUnit,
        currentPR: '',
      });
    }
    setErrors({ name: '', currentPR: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    // Validate form
    const newErrors = { name: '', currentPR: '' };
    let hasErrors = false;

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del ejercicio es requerido';
      hasErrors = true;
    } else {
      // Check for duplicate exercise name (case-insensitive)
      const nameExists = exercises.some(ex =>
        ex.id !== editingExercise?.id &&
        ex.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      if (nameExists) {
        newErrors.name = 'Ya existe un ejercicio con este nombre';
        hasErrors = true;
      }
    }

    if (!formData.currentPR || !formData.currentPR.trim()) {
      newErrors.currentPR = 'El PR actual es requerido';
      hasErrors = true;
    } else {
      const prValue = parseFloat(formData.currentPR);
      if (isNaN(prValue) || prValue <= 0) {
        newErrors.currentPR = 'El PR debe ser un número mayor a 0';
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const prValue = parseFloat(formData.currentPR);

    const exerciseData = {
      name: formData.name,
      category: formData.category,
      barType: formData.category === 'barbell' ? formData.barType : 'none',
      unit: formData.unit,
      currentPR: prValue,
    };

    if (editingExercise) {
      // Update exercise metadata
      await updateExercise(editingExercise.id, exerciseData);

      // If PR value changed or is being set for the first time, create a PR record
      const newPR = formData.currentPR ? parseFloat(formData.currentPR) : undefined;
      const oldPR = editingExercise.currentPR;

      if (newPR && newPR !== oldPR) {
        // Create historical PR record
        const barWeight = exerciseData.barType && exerciseData.barType !== 'none'
          ? getBarWeight(exerciseData.barType, exerciseData.unit)
          : 0;
        const platesWeight = newPR - barWeight;

        await addPRRecord({
          exerciseId: editingExercise.id,
          value: newPR,
          platesWeight: platesWeight > 0 ? platesWeight : undefined,
          barType: exerciseData.barType,
          date: new Date().toISOString(),
        });
      }
    } else {
      // For new exercises, just add with initial PR value
      // The initial PR is stored on the exercise itself
      // Historical PR records are created when you UPDATE the PR later
      await addExercise(exerciseData);
    }

    setModalVisible(false);
  };

  const handleDelete = (exercise: Exercise) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`⚠️ ¿Estás seguro de eliminar "${exercise.name}"? Se perderá todo el histórico.`);
      if (confirmed) {
        deleteExercise(exercise.id);
      }
    } else {
      Alert.alert(
        'Eliminar ejercicio',
        `¿Estás seguro de eliminar "${exercise.name}"? Se perderá todo el histórico.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => deleteExercise(exercise.id),
          },
        ]
      );
    }
  };

  const renderExerciseItem = ({ item }: { item: Exercise }) => {
    const icon = categories.find(c => c.value === item.category)?.icon || 'ellipse';
    return (
      <View style={[styles.exerciseItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={styles.exerciseContent}
          onPress={() => handleOpenModal(item)}
        >
          <Ionicons name={icon as any} size={24} color={theme.primary} />
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.exerciseDetails, { color: theme.textSecondary }]}>
              {item.currentPR ? `PR: ${item.currentPR} ${item.unit}` : 'Sin PR'}
              {item.barType && item.barType !== 'none' && 
                ` • Barra: ${getBarWeight(item.barType, item.unit)} ${item.unit}`}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash-outline" size={20} color={theme.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        renderItem={renderExerciseItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="add-circle-outline" size={64} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.text }]}>No hay ejercicios</Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Toca + para agregar uno</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => handleOpenModal()}
      >
        <Ionicons name="add" size={28} color={theme.background} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {editingExercise ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Nombre del ejercicio *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.surfaceLight, color: theme.text, borderColor: errors.name ? '#FF3B30' : theme.border }
                  ]}
                  value={formData.name}
                  onChangeText={(text) => {
                    setFormData({ ...formData, name: text });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="Ej: Back Squat"
                  placeholderTextColor={theme.textSecondary}
                />
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Categoría</Text>
                <View style={styles.optionsContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.optionButton,
                        { backgroundColor: theme.surfaceLight, borderColor: theme.border },
                        formData.category === cat.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                      onPress={() => {
                        const newCategory = cat.value as Exercise['category'];
                        setFormData({
                          ...formData,
                          category: newCategory,
                          barType: newCategory === 'barbell' ? 'standard' : 'none'
                        });
                      }}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={formData.category === cat.value ? theme.background : theme.text}
                      />
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.text },
                          formData.category === cat.value && { color: theme.background },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {formData.category === 'barbell' && (
                <View style={styles.formGroup}>
                  <View style={styles.barRow}>
                    <Text style={[styles.barRowLabel, { color: theme.text }]}>Barra:</Text>
                    <View style={styles.barOptionsInline}>
                      {barTypes.map((bar) => (
                        <TouchableOpacity
                          key={bar.value}
                          style={[
                            styles.barButtonInline,
                            { backgroundColor: theme.surfaceLight, borderColor: theme.border },
                            formData.barType === bar.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                          ]}
                          onPress={() => setFormData({ ...formData, barType: bar.value as Exercise['barType'] })}
                        >
                          <Text
                            style={[
                              styles.barButtonText,
                              { color: theme.text },
                              formData.barType === bar.value && { color: theme.background },
                            ]}
                          >
                            {bar.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>Unidad de medida</Text>
                <View style={styles.optionsContainer}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit.value}
                      style={[
                        styles.optionButton,
                        { backgroundColor: theme.surfaceLight, borderColor: theme.border },
                        formData.unit === unit.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                      onPress={() => setFormData({ ...formData, unit: unit.value as Exercise['unit'] })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          { color: theme.text },
                          formData.unit === unit.value && { color: theme.background },
                        ]}
                      >
                        {unit.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: theme.text }]}>PR actual *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.surfaceLight, color: theme.text, borderColor: errors.currentPR ? '#FF3B30' : theme.border }
                  ]}
                  value={formData.currentPR}
                  onChangeText={(text) => {
                    setFormData({ ...formData, currentPR: text });
                    if (errors.currentPR) setErrors({ ...errors, currentPR: '' });
                  }}
                  placeholder={`Ej: ${formData.unit === 'time' ? '5:30' : '100'}`}
                  placeholderTextColor={theme.textSecondary}
                  keyboardType={formData.unit === 'time' ? 'default' : 'numeric'}
                />
                {errors.currentPR ? (
                  <Text style={styles.errorText}>{errors.currentPR}</Text>
                ) : null}
                {formData.category === 'barbell' && formData.barType && (
                  <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                    💡 Peso total incluyendo la barra. Ejemplo: 50 lbs = 25 lbs por lado + barra de {formData.barType === 'standard' ? '45' : '35'} lbs
                  </Text>
                )}
              </View>

              {/* Buttons at the bottom inside ScrollView */}
              <View style={styles.modalFooterInside}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel, { backgroundColor: theme.surfaceLight }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.buttonCancelText, { color: theme.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSave, { backgroundColor: theme.primary }]}
                  onPress={handleSave}
                >
                  <Text style={[styles.buttonSaveText, { color: theme.background }]}>
                    {editingExercise ? 'Guardar' : 'Agregar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  exerciseItem: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  exerciseContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
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
  modalFooterInside: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 6,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  optionButtonActive: {
  },
  optionText: {
    fontSize: 14,
  },
  optionTextActive: {
    fontWeight: '600',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonCancel: {
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSave: {
  },
  buttonSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barRowLabel: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
  },
  barOptionsInline: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  barButtonInline: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  barButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
});