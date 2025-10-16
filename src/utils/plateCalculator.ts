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