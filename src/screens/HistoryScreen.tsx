import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { usePR } from '../context/PRContext';

const { width: screenWidth } = Dimensions.get('window');

export default function HistoryScreen() {
  const { exercises, getExerciseHistory, theme } = usePR();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const exerciseHistory = useMemo(() => {
    if (!selectedExerciseId) return [];
    return getExerciseHistory(selectedExerciseId);
  }, [selectedExerciseId, getExerciseHistory]);

  const chartData = useMemo(() => {
    if (exerciseHistory.length === 0) {
      return null;
    }

    const sortedHistory = [...exerciseHistory].reverse();
    const labels = sortedHistory.map(record => {
      const date = new Date(record.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const data = sortedHistory.map(record => record.value);

    return {
      labels,
      datasets: [{
        data,
        strokeWidth: 2,
      }],
    };
  }, [exerciseHistory]);

  const selectedExercise = exercises.find(ex => ex.id === selectedExerciseId);

  const handleExerciseSelect = (exerciseId: string) => {
    setSelectedExerciseId(exerciseId);
    setDropdownVisible(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView>
        <View style={styles.dropdownContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Selecciona un ejercicio:</Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              { backgroundColor: theme.surface, borderColor: theme.border }
            ]}
            onPress={() => setDropdownVisible(true)}
          >
            <Text style={[styles.dropdownText, { color: selectedExerciseId ? theme.text : theme.textSecondary }]}>
              {selectedExercise ? selectedExercise.name : 'Selecciona...'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Selecciona un ejercicio</Text>
                <TouchableOpacity
                  onPress={() => setDropdownVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={exercises}
                keyExtractor={(item) => item.id}
                style={styles.exerciseList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.exerciseItem,
                      { borderBottomColor: theme.border },
                      selectedExerciseId === item.id && { backgroundColor: theme.surfaceLight }
                    ]}
                    onPress={() => handleExerciseSelect(item.id)}
                  >
                    <Text style={[styles.exerciseText, { color: theme.text }]}>
                      {item.name}
                    </Text>
                    {item.currentPR && (
                      <Text style={[styles.exercisePR, { color: theme.primary }]}>
                        PR: {item.currentPR} {item.unit}
                      </Text>
                    )}
                    {selectedExerciseId === item.id && (
                      <Ionicons name="checkmark" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {selectedExercise && chartData && (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Progreso de {selectedExercise.name}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={chartData}
                width={Math.max(screenWidth - 32, chartData.labels.length * 60)}
                height={220}
                chartConfig={{
                  backgroundColor: theme.surface,
                  backgroundGradientFrom: theme.surface,
                  backgroundGradientTo: theme.surfaceLight,
                  decimalPlaces: 0,
                  color: (opacity = 1) => {
                    const rgb = theme.primary.match(/\w\w/g)?.map((x: string) => parseInt(x, 16)) || [0, 208, 132];
                    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
                  },
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: theme.primary,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </ScrollView>

            <View style={styles.historyList}>
              <Text style={[styles.historyTitle, { color: theme.text }]}>Historial detallado:</Text>
              {exerciseHistory.map(record => (
                <View key={record.id} style={[styles.historyItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.historyValue, { color: theme.primary }]}>
                    {record.value} {selectedExercise.unit}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {!selectedExerciseId && (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="stats-chart" size={64} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Selecciona un ejercicio
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Elige un ejercicio del menú para ver su progreso
            </Text>
          </View>
        )}

        {selectedExerciseId && !chartData && (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconContainer, { backgroundColor: theme.primary + '15' }]}>
              <Ionicons name="trending-up" size={64} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No hay historial
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Actualiza el PR de este ejercicio para empezar a trackear tu progreso
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dropdownContainer: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 50,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  exerciseList: {
    maxHeight: 400,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  exerciseText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  exercisePR: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  chartContainer: {
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  historyList: {
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  historyDate: {
    fontSize: 14,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});