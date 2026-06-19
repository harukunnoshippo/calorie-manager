import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import type { FoodPreset } from '../types';

export function usePresets() {
  return useLiveQuery(async () => {
    const presets = await db.presets.toArray();
    return presets.sort((a, b) => {
      const diff = (b.usageCount ?? 0) - (a.usageCount ?? 0);
      return diff !== 0 ? diff : b.createdAt - a.createdAt;
    });
  }, [], []);
}

export async function addPreset(data: Omit<FoodPreset, 'id' | 'createdAt' | 'usageCount'>): Promise<string> {
  const id = uuidv4();
  await db.presets.add({ id, ...data, createdAt: Date.now(), usageCount: 0 });
  return id;
}

export async function deletePreset(id: string): Promise<void> {
  await db.presets.delete(id);
}

export async function incrementPresetUsage(id: string): Promise<void> {
  const preset = await db.presets.get(id);
  if (!preset) return;
  await db.presets.update(id, { usageCount: (preset.usageCount ?? 0) + 1 });
}
