import { useState, useEffect } from 'react';
import { calculateCalories } from '../../lib/calories';

interface PFCValues {
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

interface Props {
  initial?: Partial<PFCValues>;
  confidence?: 'high' | 'medium' | 'low';
  notes?: string;
  onSave: (values: PFCValues) => void;
  onCancel: () => void;
}

const confidenceLabels = {
  high: { text: '高精度', color: 'bg-green-100 text-green-700' },
  medium: { text: '中精度', color: 'bg-yellow-100 text-yellow-700' },
  low: { text: '低精度（要確認）', color: 'bg-red-100 text-red-700' },
};

export function PFCEditor({ initial, confidence, notes, onSave, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [protein, setProtein] = useState(initial?.protein ?? 0);
  const [fat, setFat] = useState(initial?.fat ?? 0);
  const [carbs, setCarbs] = useState(initial?.carbs ?? 0);
  const [calories, setCalories] = useState(initial?.calories ?? 0);
  const [manualCalories, setManualCalories] = useState(false);

  useEffect(() => {
    if (!manualCalories) {
      setCalories(calculateCalories(protein, fat, carbs));
    }
  }, [protein, fat, carbs, manualCalories]);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setProtein(initial.protein ?? 0);
      setFat(initial.fat ?? 0);
      setCarbs(initial.carbs ?? 0);
      if (initial.calories && initial.calories > 0) {
        setCalories(initial.calories);
        setManualCalories(true);
      }
    }
  }, [initial]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), protein, fat, carbs, calories });
  };

  return (
    <div className="space-y-4">
      {confidence && (
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${confidenceLabels[confidence].color}`}>
          {confidenceLabels[confidence].text}
        </div>
      )}
      {notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{notes}</p>
      )}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">食品名</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="例: サラダチキン"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-blue-500 mb-1">P (g)</label>
          <input
            type="number"
            inputMode="decimal"
            value={protein || ''}
            onChange={(e) => setProtein(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-amber-500 mb-1">F (g)</label>
          <input
            type="number"
            inputMode="decimal"
            value={fat || ''}
            onChange={(e) => setFat(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-green-500 mb-1">C (g)</label>
          <input
            type="number"
            inputMode="decimal"
            value={carbs || ''}
            onChange={(e) => setCarbs(Number(e.target.value))}
            className="w-full px-3 py-2.5 bg-white border border-green-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-indigo-500 mb-1">
          カロリー (kcal)
          {manualCalories && (
            <button
              onClick={() => setManualCalories(false)}
              className="ml-2 text-gray-400 underline"
            >
              自動計算に戻す
            </button>
          )}
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={calories || ''}
          onChange={(e) => { setCalories(Number(e.target.value)); setManualCalories(true); }}
          className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 active:bg-gray-100"
        >
          キャンセル
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium active:bg-indigo-600 disabled:opacity-40"
        >
          保存
        </button>
      </div>
    </div>
  );
}
