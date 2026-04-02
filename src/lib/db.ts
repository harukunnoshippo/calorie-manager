import Dexie, { type EntityTable } from 'dexie';
import type { MealEntry, DailyGoal, AppSettings } from '../types';

const db = new Dexie('CalorieManager') as Dexie & {
  meals: EntityTable<MealEntry, 'id'>;
  goals: EntityTable<DailyGoal, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

db.version(1).stores({
  meals: 'id, date, category, createdAt',
  goals: 'id, effectiveFrom',
  settings: 'id',
});

export { db };
