import type { MealEntry } from '../../types';

interface Props {
  meal: MealEntry;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function MealCard({ meal, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm">
      <div className="flex-1 min-w-0" onClick={() => onEdit(meal.id)}>
        <p className="text-sm font-medium text-gray-800 truncate">{meal.name}</p>
        <div className="flex gap-3 mt-1 text-xs text-gray-500">
          <span className="text-blue-500">P {meal.protein.toFixed(1)}g</span>
          <span className="text-amber-500">F {meal.fat.toFixed(1)}g</span>
          <span className="text-green-500">C {meal.carbs.toFixed(1)}g</span>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-3 shrink-0">
        <span className="text-sm font-semibold text-indigo-600">{meal.calories} kcal</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(meal.id); }}
          className="text-gray-400 hover:text-red-500 p-1"
          aria-label="削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
