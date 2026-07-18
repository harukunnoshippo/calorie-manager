import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { WeightLog, WeightGoal } from '../types';

export function useWeightLogs(): WeightLog[] {
  return useLiveQuery(() => db.weightLogs.orderBy('date').toArray(), [], []);
}

export function useWeightGoal(): WeightGoal | undefined {
  return useLiveQuery(() => db.weightGoals.get('weight-goal'));
}

export async function saveWeightLog(date: string, weight: number): Promise<void> {
  await db.weightLogs.put({ date, weight });
}

export async function deleteWeightLog(date: string): Promise<void> {
  await db.weightLogs.delete(date);
}
