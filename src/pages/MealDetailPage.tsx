import { useParams, useNavigate } from 'react-router-dom';
import { useMeal, updateMeal, deleteMeal } from '../hooks/useMeals';
import { PFCEditor } from '../components/meals/PFCEditor';
import { MEAL_CATEGORY_LABELS } from '../types';

export function MealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const meal = useMeal(id);

  if (!meal) {
    return (
      <div className="flex-1 flex items-center justify-center pb-20">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  const handleSave = async (values: { name: string; protein: number; fat: number; carbs: number; calories: number }) => {
    await updateMeal(meal.id, values);
    navigate(-1);
  };

  const handleDelete = async () => {
    await deleteMeal(meal.id);
    navigate(-1);
  };

  return (
    <div className="flex-1 pb-20">
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-sm text-indigo-500 font-medium">
          &larr; 戻る
        </button>
        <h2 className="text-base font-semibold text-gray-800">食事の編集</h2>
        <button onClick={handleDelete} className="text-sm text-red-500 font-medium">
          削除
        </button>
      </div>

      <div className="px-5 py-4">
        <div className="mb-4 flex items-center gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            {MEAL_CATEGORY_LABELS[meal.category]}
          </span>
          <span className="text-xs text-gray-400">{meal.date}</span>
          <span className="text-xs text-gray-400">
            {meal.source === 'photo' ? '写真' : meal.source === 'text' ? 'テキスト' : '手入力'}
          </span>
        </div>

        {meal.photoBlob && (
          <img
            src={URL.createObjectURL(meal.photoBlob)}
            alt="食事の写真"
            className="w-full h-48 object-cover rounded-xl mb-4"
          />
        )}

        <PFCEditor
          initial={{
            name: meal.name,
            protein: meal.protein,
            fat: meal.fat,
            carbs: meal.carbs,
            calories: meal.calories,
          }}
          onSave={handleSave}
          onCancel={() => navigate(-1)}
        />
      </div>
    </div>
  );
}
