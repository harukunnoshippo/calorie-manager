import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { DailyGoal } from '../types';
import { DEFAULT_GOAL } from '../types';

export function useCurrentGoal(): DailyGoal {
  const goal = useLiveQuery(() => db.goals.orderBy('effectiveFrom').reverse().first());
  return goal ?? { id: 'default', effectiveFrom: '2000-01-01', ...DEFAULT_GOAL };
}

export async function saveGoal(goal: Omit<DailyGoal, 'id'>): Promise<void> {
  const id = `goal-${goal.effectiveFrom}`;
  await db.goals.put({ id, ...goal });
}
