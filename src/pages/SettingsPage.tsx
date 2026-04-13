import { useState, useEffect } from 'react';
import { useCurrentGoal, saveGoal } from '../hooks/useGoals';
import { useSettings, saveSettings } from '../hooks/useSettings';
import { calculateCalories } from '../lib/calories';
import { format } from 'date-fns';
import { exportBackup, importBackup, getLastBackupDate, isBackupOverdue } from '../lib/backup';

export function SettingsPage() {
  const goal = useCurrentGoal();
  const settings = useSettings();

  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [goalLoaded, setGoalLoaded] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(getLastBackupDate());
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const overdue = isBackupOverdue();

  const calories = calculateCalories(
    Number(protein) || 0,
    Number(fat) || 0,
    Number(carbs) || 0,
  );

  // goal is undefined while DB is loading, then either a DailyGoal or undefined (no saved goal)
  // useLiveQuery returns undefined during loading, then the actual result
  useEffect(() => {
    if (!goalLoaded && goal !== undefined) {
      setProtein(String(goal.protein));
      setFat(String(goal.fat));
      setCarbs(String(goal.carbs));
      setGoalLoaded(true);
    }
  }, [goal, goalLoaded]);

  useEffect(() => {
    if (settings?.claudeApiKey) setApiKey(settings.claudeApiKey);
  }, [settings]);

  const handleSaveGoal = async () => {
    await saveGoal({
      calories,
      protein: Number(protein) || 0,
      fat: Number(fat) || 0,
      carbs: Number(carbs) || 0,
      effectiveFrom: format(new Date(), 'yyyy-MM-dd'),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveApiKey = async () => {
    await saveSettings({ claudeApiKey: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    await exportBackup();
    setLastBackup(getLastBackupDate());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('既存データを上書きしてインポートしますか？')) {
      e.target.value = '';
      return;
    }
    try {
      const result = await importBackup(file);
      setImportMsg(`${result.mealsCount}件の食事を含む${result.totalTables}テーブルを復元しました`);
      setTimeout(() => setImportMsg(null), 4000);
    } catch {
      setImportMsg('インポートに失敗しました。ファイル形式を確認してください');
      setTimeout(() => setImportMsg(null), 4000);
    }
    e.target.value = '';
  };

  return (
    <div className="flex-1 pb-20">
      <div className="px-5 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800 text-center">設定</h2>
      </div>

      <div className="px-5 py-4 space-y-6">
        {saved && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium z-50 animate-fade-in">
            保存しました
          </div>
        )}

        {/* Daily Goals */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-700">1日の目標</h3>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-500 mb-1">P (g)</label>
              <input
                type="number"
                inputMode="decimal"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="60"
                className="w-full px-3 py-2.5 bg-gray-50 border border-blue-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-500 mb-1">F (g)</label>
              <input
                type="number"
                inputMode="decimal"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder="55"
                className="w-full px-3 py-2.5 bg-gray-50 border border-amber-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-green-500 mb-1">C (g)</label>
              <input
                type="number"
                inputMode="decimal"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="300"
                className="w-full px-3 py-2.5 bg-gray-50 border border-green-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-indigo-500 mb-1">カロリー (kcal) — PFCから自動計算</label>
            <div className="w-full px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-center font-semibold text-indigo-700">
              {calories} kcal
            </div>
          </div>

          <button
            onClick={handleSaveGoal}
            className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium active:bg-indigo-600"
          >
            目標を保存
          </button>
        </div>

        {/* API Key */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-700">Claude API</h3>
          <p className="text-xs text-gray-400">写真読み取り・テキスト推定に使用します</p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSaveApiKey}
            className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium active:bg-indigo-600"
          >
            APIキーを保存
          </button>
        </div>

        {/* Data Export/Import */}
        <div className={`bg-white rounded-2xl p-5 shadow-sm space-y-4 ${overdue ? 'ring-2 ring-amber-300' : ''}`}>
          <h3 className="text-sm font-bold text-gray-700">バックアップ</h3>
          {overdue && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-xs font-medium">
              <span>⚠️</span>
              <span>{lastBackup ? '7日以上バックアップしていません' : 'まだバックアップしていません'}</span>
            </div>
          )}
          {lastBackup && (
            <p className="text-xs text-gray-400">
              最終バックアップ: {format(new Date(lastBackup), 'yyyy/MM/dd HH:mm')}
            </p>
          )}
          <p className="text-xs text-gray-400">全データ（食事・目標・プリセット・設定）をJSONファイルとして保存します。写真は含まれません。</p>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className={`flex-1 py-3 rounded-xl text-sm font-medium active:bg-indigo-600 ${overdue ? 'bg-indigo-500 text-white' : 'border border-gray-200 text-gray-600 active:bg-gray-100'}`}
            >
              バックアップ
            </button>
            <label className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 active:bg-gray-100 text-center cursor-pointer">
              復元
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
          {importMsg && (
            <p className="text-xs text-center text-emerald-600 font-medium">{importMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
