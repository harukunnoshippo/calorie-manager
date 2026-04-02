import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import type { AppSettings } from '../types';

export function useSettings(): AppSettings | undefined {
  return useLiveQuery(() => db.settings.get('settings'));
}

export async function saveSettings(data: Partial<AppSettings>): Promise<void> {
  await db.settings.put({ id: 'settings', ...data });
}
