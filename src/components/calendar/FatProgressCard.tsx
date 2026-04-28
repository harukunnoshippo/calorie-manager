import { useState } from 'react';
import { useFatReduction } from '../../hooks/useFatReduction';
import { useWeightGoal, saveWeightGoal, deleteWeightGoal } from '../../hooks/useWeightGoal';

export function FatProgressCard() {
  const fatReduction = useFatReduction();
  const weightGoal = useWeightGoal();
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState('');

  const handleOpenEdit = () => {
    setInput(weightGoal ? String(weightGoal.targetKg) : '3');
    setEditing(true);
  };

  const handleSave = async () => {
    const v = parseFloat(input);
    if (!isNaN(v) && v > 0) {
      await saveWeightGoal(v);
      setEditing(false);
    }
  };

  const handleClear = async () => {
    await deleteWeightGoal();
    setEditing(false);
  };

  const fatKg = fatReduction.fatKg;
  const target = weightGoal?.targetKg ?? 0;
  const progress = target > 0 ? Math.min(100, Math.max(0, (fatKg / target) * 100)) : 0;

  const barColor =
    progress >= 100 ? 'bg-amber-400'
    : progress >= 50 ? 'bg-emerald-400'
    : 'bg-indigo-400';

  return (
    <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">体脂肪減少の進捗</span>
          <span className="text-xs text-gray-400">（昨日まで）</span>
        </div>
        <button
          onClick={handleOpenEdit}
          className="text-xs text-indigo-500 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50"
        >
          {weightGoal ? '目標変更' : '目標設定'}
        </button>
      </div>

      {weightGoal ? (
        <>
          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold ${fatKg >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {fatKg >= 0 ? '-' : '+'}{Math.abs(fatKg).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/ -{target} kg</span>
            </div>
            <span className="text-sm font-semibold text-gray-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span>累積{fatReduction.cumulativeDeficit >= 0 ? '赤字' : '黒字'}: {Math.abs(fatReduction.cumulativeDeficit).toLocaleString()} kcal</span>
            <span>記録日数: {fatReduction.daysTracked}日</span>
          </div>
          <p className="text-[10px] text-gray-300 mt-2">TDEE 2,000 kcal / 体脂肪1kg = 7,200 kcal で計算</p>
        </>
      ) : (
        <div className="py-3 text-center">
          <p className="text-xs text-gray-500 mb-3">目標を設定すると進捗バーが表示されます</p>
          <button
            onClick={handleOpenEdit}
            className="px-4 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600"
          >
            目標を設定する
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6" onClick={() => setEditing(false)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-800 mb-3">体脂肪減少の目標</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">-</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="3"
              />
              <span className="text-sm text-gray-500">kg</span>
            </div>
            <div className="flex gap-2">
              {weightGoal && (
                <button
                  onClick={handleClear}
                  className="px-3 py-2 text-xs text-red-500 rounded-lg hover:bg-red-50"
                >
                  削除
                </button>
              )}
              <button
                onClick={() => setEditing(false)}
                className="flex-1 px-3 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
