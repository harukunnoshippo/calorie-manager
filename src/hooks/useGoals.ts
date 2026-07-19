import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { DailyGoal } from '../types';

export function useCurrentGoal(): DailyGoal | undefined {
  return useLiveQuery(() => db.goals.orderBy('effectiveFrom').reverse().first());
}

export function useGoalForDate(date: string): DailyGoal | undefined {
  return useLiveQuery(async () => {
    const goal = await db.goals.orderBy('effectiveFrom').reverse().first();
    if (!goal) return undefined;
    const isTraining = await db.trainingDays.get(date);
    if (!isTraining) return goal;
    return {
      ...goal,
      protein: goal.trainingProtein ?? goal.protein,
      fat: goal.trainingFat ?? goal.fat,
      carbs: goal.trainingCarbs ?? goal.carbs,
      calories: goal.trainingCalories ?? goal.calories,
    };
  }, [date]);
}

export async function saveGoal(goal: Omit<DailyGoal, 'id'>): Promise<void> {
  const id = `goal-${goal.effectiveFrom}`;
  await db.goals.put({ id, ...goal });
}
