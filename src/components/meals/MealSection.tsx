import type { MealEntry, MealCategory } from '../../types';
import { MEAL_CATEGORY_LABELS } from '../../types';
import { MealCard } from './MealCard';

interface Props {
  category: MealCategory;
  meals: MealEntry[];
  onAdd: (category: MealCategory) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<MealCategory, string> = {
  breakfast: '\u2600\uFE0F',
  lunch: '\uD83C\uDF1E',
  dinner: '\uD83C\uDF19',
  snack: '\uD83C\uDF6A',
};

export function MealSection({ category, meals, onAdd, onEdit, onDelete }: Props) {
  const totalCal = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.protein, 0);
  const totalFat = meals.reduce((s, m) => s + m.fat, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbs, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span>{categoryIcons[category]}</span>
          <h3 className="text-sm font-semibold text-gray-700">{MEAL_CATEGORY_LABELS[category]}</h3>
          {meals.length > 0 && (
            <>
              <span className="text-xs text-gray-400">{totalCal} kcal</span>
              <span className="text-xs text-blue-400">P {Math.round(totalProtein)}g</span>
              <span className="text-xs text-amber-400">F {Math.round(totalFat)}g</span>
              <span className="text-xs text-green-400">C {Math.round(totalCarbs)}g</span>
            </>
          )}
        </div>
        <button
          onClick={() => onAdd(category)}
          className="w-7 h-7 flex items-center justify-center bg-indigo-500 text-white rounded-full text-lg leading-none hover:bg-indigo-600 active:scale-95 transition"
        >
          +
        </button>
      </div>
      {meals.length === 0 ? (
        <p className="text-xs text-gray-400 pl-7">まだ記録がありません</p>
      ) : (
        <div className="space-y-2">
          {meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
