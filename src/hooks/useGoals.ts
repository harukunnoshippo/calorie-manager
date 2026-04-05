import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { DailyGoal } from '../types';

export function useCurrentGoal(): DailyGoal | undefined {
  return useLiveQuery(() => db.goals.orderBy('effectiveFrom').reverse().first());
}

export async function saveGoal(goal: Omit<DailyGoal, 'id'>): Promise<void> {
  const id = `goal-${goal.effectiveFrom}`;
  await db.goals.put({ id, ...goal });
}
