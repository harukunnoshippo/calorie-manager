import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

export function useIsTrainingDay(date: string): boolean {
  return !!useLiveQuery(() => db.trainingDays.get(date), [date]);
}

export async function toggleTrainingDay(date: string): Promise<void> {
  const existing = await db.trainingDays.get(date);
  if (existing) {
    await db.trainingDays.delete(date);
  } else {
    await db.trainingDays.put({ date });
  }
}
