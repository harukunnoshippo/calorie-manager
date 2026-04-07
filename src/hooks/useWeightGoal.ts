import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format } from 'date-fns';
import type { WeightGoal } from '../types';

export function useWeightGoal(): WeightGoal | undefined {
  return useLiveQuery(() => db.weightGoals.get('weight-goal'));
}

export async function saveWeightGoal(targetKg: number): Promise<void> {
  const existing = await db.weightGoals.get('weight-goal');
  await db.weightGoals.put({
    id: 'weight-goal',
    targetKg,
    startDate: existing?.startDate ?? format(new Date(), 'yyyy-MM-dd'),
  });
}

export async function deleteWeightGoal(): Promise<void> {
  await db.weightGoals.delete('weight-goal');
}
