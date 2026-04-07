import Dexie, { type EntityTable } from 'dexie';
import type { MealEntry, DailyGoal, AppSettings, FoodPreset, WeightGoal } from '../types';

const db = new Dexie('CalorieManager') as Dexie & {
  meals: EntityTable<MealEntry, 'id'>;
  goals: EntityTable<DailyGoal, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
  presets: EntityTable<FoodPreset, 'id'>;
  weightGoals: EntityTable<WeightGoal, 'id'>;
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

db.version(3).stores({
  meals: 'id, date, category, createdAt',
  goals: 'id, effectiveFrom',
  settings: 'id',
  presets: 'id, name, createdAt',
  weightGoals: 'id',
});

export { db };
