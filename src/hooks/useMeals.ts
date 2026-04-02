import { useLiveQuery } from 'dexie-react-hooks';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import type { MealEntry, MealCategory } from '../types';

export function useMealsByDate(date: string) {
  return useLiveQuery(() => db.meals.where('date').equals(date).toArray(), [date], []);
}

export async function addMeal(
  date: string,
  category: MealCategory,
  data: { name: string; calories: number; protein: number; fat: number; carbs: number; source: MealEntry['source']; photoBlob?: Blob }
): Promise<string> {
  const id = uuidv4();
  const now = Date.now();
  await db.meals.add({
    id,
    date,
    category,
    name: data.name,
    calories: data.calories,
    protein: data.protein,
    fat: data.fat,
    carbs: data.carbs,
    source: data.source,
    photoBlob: data.photoBlob,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export async function updateMeal(id: string, data: Partial<MealEntry>): Promise<void> {
  await db.meals.update(id, { ...data, updatedAt: Date.now() });
}

export async function deleteMeal(id: string): Promise<void> {
  await db.meals.delete(id);
}

export function useMeal(id: string | undefined) {
  return useLiveQuery(() => (id ? db.meals.get(id) : undefined), [id]);
}
