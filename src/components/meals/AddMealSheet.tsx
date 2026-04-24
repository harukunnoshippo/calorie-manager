import { useState } from 'react';
import type { MealCategory, NutritionResponse, FoodPreset } from '../../types';
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORIES } from '../../types';
import { PFCEditor } from './PFCEditor';
import { PhotoCapture } from './PhotoCapture';
import type { PhotoResult } from './PhotoCapture';
import { TextInput } from './TextInput';
import { FoodList } from './FoodList';
import { addMeal } from '../../hooks/useMeals';
import { usePresets } from '../../hooks/usePresets';

interface Props {
  date: string;
  initialCategory: MealCategory;
  onClose: () => void;
}

type InputTab = 'photo' | 'text' | 'manual' | 'list';
type Step = 'input' | 'edit' | 'photo-batch';

export function AddMealSheet({ date, initialCategory, onClose }: Props) {
  const [category, setCategory] = useState<MealCategory>(initialCategory);
  const [tab, setTab] = useState<InputTab>('list');
  const [step, setStep] = useState<Step>('input');
  const [nutritionResult, setNutritionResult] = useState<NutritionResponse | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>();
  const [batchPhotoResults, setBatchPhotoResults] = useState<PhotoResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [listSelectedIds, setListSelectedIds] = useState<Set<string>>(new Set());
  const allPresets = usePresets();

  const handlePhotoResult = (result: NutritionResponse, blob: Blob) => {
    setNutritionResult(result);
    setPhotoBlob(blob);
    setStep('edit');
    setError(null);
  };

  const handlePhotoResults = (results: PhotoResult[]) => {
    setBatchPhotoResults(results);
    setStep('photo-batch');
    setError(null);
  };

  const handleBatchPhotoSave = async () => {
    for (const { result, blob } of batchPhotoResults) {
      await addMeal(date, category, {
        name: result.name,
        protein: result.protein,
        fat: result.fat,
        carbs: result.carbs,
        calories: result.calories,
        source: 'photo',
        photoBlob: blob,
      });
    }
    onClose();
  };

  const handleTextResult = (result: NutritionResponse) => {
    setNutritionResult(result);
    setStep('edit');
    setError(null);
  };

  const handleSave = async (values: { name: string; protein: number; fat: number; carbs: number; calories: number }) => {
    await addMeal(date, category, {
      ...values,
      source: tab === 'list' ? 'manual' : tab,
      photoBlob,
    });
    onClose();
  };

  const handleListToggle = (id: string) => {
    setListSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePresetSelect = async (presets: FoodPreset[]) => {
    for (const preset of presets) {
      await addMeal(date, category, {
        name: preset.name,
        protein: preset.protein,
        fat: preset.fat,
        carbs: preset.carbs,
        calories: preset.calories,
        source: 'manual',
      });
    }
    onClose();
  };

  const tabs: { key: InputTab; label: string }[] = [
    { key: 'list', label: 'リスト' },
    { key: 'photo', label: '写真' },
    { key: 'text', label: 'テキスト' },
    { key: 'manual', label: '手入力' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-gray-50 rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="shrink-0 bg-gray-50 px-5 pt-4 pb-3 border-b border-gray-200">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800 text-center">食事を追加</h2>

          <div className="flex gap-2 mt-3">
            {MEAL_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${
                  category === c ? 'bg-indigo-500 text-white' : 'bg-white text-gray-500 border border-gray-200'
                }`}
              >
                {MEAL_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
          {step === 'input' && (
            <>
              <div className="flex gap-1 bg-gray-200 rounded-lg p-1 mb-4">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setError(null); }}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                      tab === t.key ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">{error}</div>
              )}

              {tab === 'list' && (
                <FoodList
                  selectedIds={listSelectedIds}
                  onToggle={handleListToggle}
                />
              )}
              {tab === 'photo' && (
                <PhotoCapture onResult={handlePhotoResult} onResults={handlePhotoResults} onError={setError} />
              )}
              {tab === 'text' && (
                <TextInput onResult={handleTextResult} onError={setError} />
              )}
              {tab === 'manual' && (
                <PFCEditor onSave={handleSave} onCancel={onClose} />
              )}
            </>
          )}

          {step === 'edit' && nutritionResult && (
            <PFCEditor
              initial={nutritionResult}
              confidence={nutritionResult.confidence}
              notes={nutritionResult.notes}
              onSave={handleSave}
              onCancel={() => { setStep('input'); setNutritionResult(null); }}
            />
          )}

          {step === 'photo-batch' && batchPhotoResults.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                {batchPhotoResults.length}件の解析結果
              </p>
              {batchPhotoResults.map((item, i) => (
                <div key={i} className="bg-white rounded-xl px-4 py-3 shadow-sm">
                  <p className="text-sm font-medium text-gray-800">{item.result.name}</p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className="text-blue-500">P {item.result.protein.toFixed(1)}g</span>
                    <span className="text-amber-500">F {item.result.fat.toFixed(1)}g</span>
                    <span className="text-green-500">C {item.result.carbs.toFixed(1)}g</span>
                    <span className="text-indigo-500">{item.result.calories} kcal</span>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setStep('input'); setBatchPhotoResults([]); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500"
                >
                  戻る
                </button>
                <button
                  onClick={handleBatchPhotoSave}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium"
                >
                  まとめて保存（{batchPhotoResults.length}件）
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer: "まとめて追加" button for list tab */}
        {step === 'input' && tab === 'list' && listSelectedIds.size > 0 && (
          <div className="shrink-0 px-5 pb-6 pt-3 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => handlePresetSelect(
                allPresets.filter((p) => listSelectedIds.has(p.id))
              )}
              className="w-full py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium active:bg-indigo-600"
            >
              まとめて追加（{listSelectedIds.size}件）
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
