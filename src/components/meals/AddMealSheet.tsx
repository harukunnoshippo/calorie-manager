import { useState } from 'react';
import type { MealCategory, NutritionResponse } from '../../types';
import { MEAL_CATEGORY_LABELS, MEAL_CATEGORIES } from '../../types';
import { PFCEditor } from './PFCEditor';
import { PhotoCapture } from './PhotoCapture';
import { TextInput } from './TextInput';
import { addMeal } from '../../hooks/useMeals';

interface Props {
  date: string;
  initialCategory: MealCategory;
  onClose: () => void;
}

type InputTab = 'photo' | 'text' | 'manual';
type Step = 'input' | 'edit';

export function AddMealSheet({ date, initialCategory, onClose }: Props) {
  const [category, setCategory] = useState<MealCategory>(initialCategory);
  const [tab, setTab] = useState<InputTab>('photo');
  const [step, setStep] = useState<Step>('input');
  const [nutritionResult, setNutritionResult] = useState<NutritionResponse | null>(null);
  const [photoBlob, setPhotoBlob] = useState<Blob | undefined>();
  const [error, setError] = useState<string | null>(null);

  const handlePhotoResult = (result: NutritionResponse, blob: Blob) => {
    setNutritionResult(result);
    setPhotoBlob(blob);
    setStep('edit');
    setError(null);
  };

  const handleTextResult = (result: NutritionResponse) => {
    setNutritionResult(result);
    setStep('edit');
    setError(null);
  };

  const handleSave = async (values: { name: string; protein: number; fat: number; carbs: number; calories: number }) => {
    await addMeal(date, category, {
      ...values,
      source: tab,
      photoBlob,
    });
    onClose();
  };

  const tabs: { key: InputTab; label: string }[] = [
    { key: 'photo', label: '写真' },
    { key: 'text', label: 'テキスト' },
    { key: 'manual', label: '手入力' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-gray-50 rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-gray-50 z-10 px-5 pt-4 pb-3 border-b border-gray-200">
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

        <div className="px-5 py-4">
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

              {tab === 'photo' && (
                <PhotoCapture onResult={handlePhotoResult} onError={setError} />
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
        </div>
      </div>
    </div>
  );
}
