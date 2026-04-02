import Dexie, { type EntityTable } from 'dexie';
import type { MealEntry, DailyGoal, AppSettings, FoodPreset } from '../types';

const db = new Dexie('CalorieManager') as Dexie & {
  meals: EntityTable<MealEntry, 'id'>;
  goals: EntityTable<DailyGoal, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
  presets: EntityTable<FoodPreset, 'id'>;
};

db.version(1).stores({
  meals: 'id, date, category, createdAt',
  goals: 'id, effectiveFrom',
  settings: 'id',
});

db.version(2).stores({
  meals: 'id, date, category, createdAt',
  goals: 'id, effectiveFrom',
  settings: 'id',
  presets: 'id, name, createdAt',
});

export { db };
