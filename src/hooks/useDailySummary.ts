import { useMemo } from 'react';
import type { MealEntry, DailyGoal, DailySummary } from '../types';

export function useDailySummary(meals: MealEntry[], goal: DailyGoal): DailySummary {
  return useMemo(() => {
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = meals.reduce((sum, m) => sum + m.protein, 0);
    const totalFat = meals.reduce((sum, m) => sum + m.fat, 0);
    const totalCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);

    return {
      date: goal.effectiveFrom,
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
      remainingCalories: goal.calories - totalCalories,
      remainingProtein: goal.protein - totalProtein,
      remainingFat: goal.fat - totalFat,
      remainingCarbs: goal.carbs - totalCarbs,
      meals,
    };
  }, [meals, goal]);
}
