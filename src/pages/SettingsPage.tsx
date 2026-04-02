import { useState, useEffect } from 'react';
import { useCurrentGoal, saveGoal } from '../hooks/useGoals';
import { useSettings, saveSettings } from '../hooks/useSettings';
import { format } from 'date-fns';
import { db } from '../lib/db';

export function SettingsPage() {
  const goal = useCurrentGoal();
  const settings = useSettings();

  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCalories(goal.calories);
    setProtein(goal.protein);
    setFat(goal.fat);
    setCarbs(goal.carbs);
  }, [goal]);

  useEffect(() => {
    if (settings?.claudeApiKey) setApiKey(settings.claudeApiKey);
  }, [settings]);

  const handleSaveGoal = async () => {
    await saveGoal({
      calories,
      protein,
      fat,
      carbs,
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
    const meals = await db.meals.toArray();
    const goals = await db.goals.toArray();
    const data = JSON.stringify({ meals, goals }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calorie-data-${format(new Date(), 'yyyyMMdd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const data = JSON.parse(text);
    if (data.meals) {
      await db.meals.bulkPut(data.meals);
    }
    if (data.goals) {
      await db.goals.bulkPut(data.goals);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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

          <div>
            <label className="block text-xs font-medium text-indigo-500 mb-1">カロリー (kcal)</label>
            <input
              type="number"
              inputMode="numeric"
              value={calories || ''}
              onChange={(e) => setCalories(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-500 mb-1">P (g)</label>
              <input
                type="number"
                inputMode="numeric"
                value={protein || ''}
                onChange={(e) => setProtein(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-blue-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-500 mb-1">F (g)</label>
              <input
                type="number"
                inputMode="numeric"
                value={fat || ''}
                onChange={(e) => setFat(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-amber-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-green-500 mb-1">C (g)</label>
              <input
                type="number"
                inputMode="numeric"
                value={carbs || ''}
                onChange={(e) => setCarbs(Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-green-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300"
              />
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
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-700">データ管理</h3>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 active:bg-gray-100"
            >
              エクスポート
            </button>
            <label className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 active:bg-gray-100 text-center cursor-pointer">
              インポート
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
