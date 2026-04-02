import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import type { FoodPreset } from '../types';

export function usePresets() {
  return useLiveQuery(() => db.presets.orderBy('createdAt').reverse().toArray(), [], []);
}

export async function addPreset(data: Omit<FoodPreset, 'id' | 'createdAt'>): Promise<string> {
  const id = uuidv4();
  await db.presets.add({ id, ...data, createdAt: Date.now() });
  return id;
}

export async function deletePreset(id: string): Promise<void> {
  await db.presets.delete(id);
}
