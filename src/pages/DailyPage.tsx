import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { ja } from 'date-fns/locale';
import { DailyProgress } from '../components/dashboard/DailyProgress';
import { PFCBars } from '../components/dashboard/PFCBars';
import { MealSection } from '../components/meals/MealSection';
import { AddMealSheet } from '../components/meals/AddMealSheet';
import { useMealsByDate, deleteMeal } from '../hooks/useMeals';
import { useCurrentGoal } from '../hooks/useGoals';
import { useDailySummary } from '../hooks/useDailySummary';
import { MEAL_CATEGORIES, DEFAULT_GOAL } from '../types';
import type { MealCategory } from '../types';
import { useNavigate } from 'react-router-dom';

export function DailyPage() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showSheet, setShowSheet] = useState(false);
  const [sheetCategory, setSheetCategory] = useState<MealCategory>('breakfast');
  const navigate = useNavigate();

  const meals = useMealsByDate(date);
  const savedGoal = useCurrentGoal();
  const goal = savedGoal ?? { id: 'default', effectiveFrom: '2000-01-01', ...DEFAULT_GOAL };
  const summary = useDailySummary(meals, goal);

  const displayDate = format(new Date(date), 'M月d日 (E)', { locale: ja });

  const handleAdd = (category: MealCategory) => {
    setSheetCategory(category);
    setShowSheet(true);
  };

  const handleEdit = (id: string) => {
    navigate(`/meal/${id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteMeal(id);
  };

  return (
    <div className="flex-1 pb-20">
      {/* Date Navigation */}
      <div className="flex items-center justify-between px-5 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button
          onClick={() => setDate(format(subDays(new Date(date), 1), 'yyyy-MM-dd'))}
          className="p-2 text-gray-400 active:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        <button
          onClick={() => setDate(format(new Date(), 'yyyy-MM-dd'))}
          className="text-base font-semibold text-gray-800"
        >
          {displayDate}
        </button>
        <button
          onClick={() => setDate(format(addDays(new Date(date), 1), 'yyyy-MM-dd'))}
          className="p-2 text-gray-400 active:text-gray-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dashboard */}
      <div className="px-5 py-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <DailyProgress consumed={summary.totalCalories} goal={goal.calories} />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <PFCBars
            protein={summary.totalProtein}
            fat={summary.totalFat}
            carbs={summary.totalCarbs}
            goalProtein={goal.protein}
            goalFat={goal.fat}
            goalCarbs={goal.carbs}
          />
        </div>

      </div>

      {/* Meal Sections */}
      <div className="px-5 space-y-5">
        {MEAL_CATEGORIES.map((cat) => (
          <MealSection
            key={cat}
            category={cat}
            meals={meals.filter((m) => m.category === cat)}
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showSheet && (
        <AddMealSheet
          date={date}
          initialCategory={sheetCategory}
          onClose={() => setShowSheet(false)}
        />
      )}
    </div>
  );
}
