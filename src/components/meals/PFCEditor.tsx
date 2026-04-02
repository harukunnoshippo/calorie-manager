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
  const [protein, setProtein] = useState(initial?.protein != null ? String(initial.protein) : '');
  const [fat, setFat] = useState(initial?.fat != null ? String(initial.fat) : '');
  const [carbs, setCarbs] = useState(initial?.carbs != null ? String(initial.carbs) : '');
  const [caloriesStr, setCaloriesStr] = useState(initial?.calories != null ? String(initial.calories) : '');
  const [manualCalories, setManualCalories] = useState(false);

  const proteinNum = Number(protein) || 0;
  const fatNum = Number(fat) || 0;
  const carbsNum = Number(carbs) || 0;
  const calories = manualCalories ? (Number(caloriesStr) || 0) : calculateCalories(proteinNum, fatNum, carbsNum);

  useEffect(() => {
    if (!manualCalories) {
      setCaloriesStr(String(calculateCalories(proteinNum, fatNum, carbsNum)));
    }
  }, [proteinNum, fatNum, carbsNum, manualCalories]);

  useEffect(() => {
    if (initial) {
      setName(initial.name ?? '');
      setProtein(initial.protein != null ? String(initial.protein) : '');
      setFat(initial.fat != null ? String(initial.fat) : '');
      setCarbs(initial.carbs != null ? String(initial.carbs) : '');
      if (initial.calories && initial.calories > 0) {
        setCaloriesStr(String(initial.calories));
        setManualCalories(true);
      }
    }
  }, [initial]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), protein: proteinNum, fat: fatNum, carbs: carbsNum, calories });
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
            step="0.1"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
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
            className="w-full px-3 py-2.5 bg-white border border-amber-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
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
          step="1"
          value={caloriesStr}
          onChange={(e) => { setCaloriesStr(e.target.value); setManualCalories(true); }}
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
