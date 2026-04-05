import { useState } from 'react';
import { usePresets, addPreset, deletePreset } from '../../hooks/usePresets';
import { calculateCalories } from '../../lib/calories';
import type { FoodPreset } from '../../types';

interface Props {
  onSelect: (presets: FoodPreset[]) => void;
}

export function FoodList({ onSelect }: Props) {
  const presets = usePresets();
  const [showAdd, setShowAdd] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [carbs, setCarbs] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchAdd = () => {
    const selected = presets.filter((p) => selectedIds.has(p.id));
    if (selected.length > 0) {
      onSelect(selected);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) return;
    const p = Number(protein) || 0;
    const f = Number(fat) || 0;
    const c = Number(carbs) || 0;
    await addPreset({
      name: name.trim(),
      protein: p,
      fat: f,
      carbs: c,
      calories: calculateCalories(p, f, c),
    });
    setName('');
    setProtein('');
    setFat('');
    setCarbs('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-3">
      {presets.length === 0 && !showAdd && (
        <p className="text-sm text-gray-400 text-center py-4">
          よく食べる食品を登録しておくと<br />ワンタップで追加できます
        </p>
      )}

      {presets.map((preset) => {
        const checked = selectedIds.has(preset.id);
        return (
          <div key={preset.id} className="flex items-center bg-white rounded-xl px-4 py-3 shadow-sm">
            <button
              onClick={() => toggleSelect(preset.id)}
              className={`w-5 h-5 rounded border-2 mr-3 shrink-0 flex items-center justify-center transition ${
                checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
              }`}
            >
              {checked && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button
              onClick={() => toggleSelect(preset.id)}
              className="flex-1 min-w-0 text-left"
            >
              <p className="text-sm font-medium text-gray-800 truncate">{preset.name}</p>
              <div className="flex gap-3 mt-1 text-xs">
                <span className="text-blue-500">P {preset.protein.toFixed(1)}g</span>
                <span className="text-amber-500">F {preset.fat.toFixed(1)}g</span>
                <span className="text-green-500">C {preset.carbs.toFixed(1)}g</span>
                <span className="text-indigo-500">{preset.calories} kcal</span>
              </div>
            </button>
            <button
              onClick={() => deletePreset(preset.id)}
              className="text-gray-300 hover:text-red-500 p-1 ml-2 shrink-0"
              aria-label="削除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        );
      })}

      {selectedIds.size > 0 && (
        <button
          onClick={handleBatchAdd}
          className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium active:bg-indigo-600"
        >
          まとめて追加（{selectedIds.size}件）
        </button>
      )}

      {showAdd ? (
        <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="食品名（例: プロテイン1杯）"
            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-blue-500 mb-1">P (g)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full px-2 py-2 bg-gray-50 border border-blue-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-amber-500 mb-1">F (g)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full px-2 py-2 bg-gray-50 border border-amber-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-green-500 mb-1">C (g)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full px-2 py-2 bg-gray-50 border border-green-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300"
              />
            </div>
          </div>
          <div className="text-center text-xs text-indigo-500 font-medium">
            {calculateCalories(Number(protein) || 0, Number(fat) || 0, Number(carbs) || 0)} kcal
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500"
            >
              キャンセル
            </button>
            <button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium disabled:opacity-40"
            >
              リストに保存
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-400 active:bg-gray-50"
        >
          + 新しい食品を登録
        </button>
      )}
    </div>
  );
}
