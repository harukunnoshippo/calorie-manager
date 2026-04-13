import { format } from 'date-fns';
import { db } from './db';
import type { BackupData } from '../types';

const LAST_BACKUP_KEY = 'calorie-manager-last-backup';
const BACKUP_WARN_DAYS = 7;

export async function exportBackup(): Promise<void> {
  const [meals, goals, settings, presets, weightGoals] = await Promise.all([
    db.meals.toArray(),
    db.goals.toArray(),
    db.settings.toArray(),
    db.presets.toArray(),
    db.weightGoals.toArray(),
  ]);

  // Strip photoBlob from meals
  const mealsWithoutPhoto = meals.map(({ photoBlob: _, ...rest }) => rest);

  const backup: BackupData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      meals: mealsWithoutPhoto,
      goals,
      settings,
      presets,
      weightGoals,
    },
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calorie-backup-${format(new Date(), 'yyyyMMdd')}.json`;
  a.click();
  URL.revokeObjectURL(url);

  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
}

export async function importBackup(file: File): Promise<{ mealsCount: number; totalTables: number }> {
  const text = await file.text();
  const raw = JSON.parse(text);

  // Version 2 format
  if (raw.version === 2 && raw.data) {
    const { meals, goals, settings, presets, weightGoals } = raw.data;
    if (meals?.length) await db.meals.bulkPut(meals);
    if (goals?.length) await db.goals.bulkPut(goals);
    if (settings?.length) await db.settings.bulkPut(settings);
    if (presets?.length) await db.presets.bulkPut(presets);
    if (weightGoals?.length) await db.weightGoals.bulkPut(weightGoals);
    return {
      mealsCount: meals?.length ?? 0,
      totalTables: [meals, goals, settings, presets, weightGoals].filter((t) => t?.length).length,
    };
  }

  // Version 1 fallback (old format: { meals, goals })
  if (raw.meals) await db.meals.bulkPut(raw.meals);
  if (raw.goals) await db.goals.bulkPut(raw.goals);
  return {
    mealsCount: raw.meals?.length ?? 0,
    totalTables: [raw.meals, raw.goals].filter((t) => t?.length).length,
  };
}

export function getLastBackupDate(): string | null {
  return localStorage.getItem(LAST_BACKUP_KEY);
}

export function isBackupOverdue(): boolean {
  const last = getLastBackupDate();
  if (!last) return true;
  const diff = Date.now() - new Date(last).getTime();
  return diff > BACKUP_WARN_DAYS * 24 * 60 * 60 * 1000;
}
