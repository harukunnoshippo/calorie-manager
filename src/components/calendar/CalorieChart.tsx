import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { db } from '../../lib/db';
import { useCurrentGoal } from '../../hooks/useGoals';
import { DEFAULT_GOAL } from '../../types';

const DAYS = 14;

export function CalorieChart() {
  const goal = useCurrentGoal();
  const goalCalories = goal?.calories ?? DEFAULT_GOAL.calories;

  const today = new Date();
  const start = subDays(today, DAYS - 1);
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(today, 'yyyy-MM-dd');

  const meals = useLiveQuery(
    () => db.meals.where('date').between(startStr, endStr, true, true).toArray(),
    [startStr, endStr],
    []
  );

  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const meal of meals) {
      map.set(meal.date, (map.get(meal.date) ?? 0) + meal.calories);
    }
    return eachDayOfInterval({ start, end: today }).map((d) => {
      const dateStr = format(d, 'yyyy-MM-dd');
      return { date: d, dateStr, calories: map.get(dateStr) ?? 0 };
    });
  }, [meals, startStr, endStr]);

  const maxCal = Math.max(goalCalories * 1.3, ...data.map((d) => d.calories), 1);

  const getColor = (cal: number) => {
    if (cal === 0) return 'bg-gray-200';
    const ratio = cal / goalCalories;
    if (ratio <= 1.0) return 'bg-emerald-400';
    if (ratio <= 1.15) return 'bg-amber-400';
    return 'bg-red-400';
  };

  return (
    <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-700">過去14日のカロリー</span>
        <span className="text-xs text-gray-400">目標 {goalCalories} kcal</span>
      </div>
      <div className="relative h-32">
        {/* Goal line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-indigo-300 z-10 pointer-events-none"
          style={{ top: `${100 - (goalCalories / maxCal) * 100}%` }}
        >
          <span className="absolute -top-3 right-0 text-[9px] text-indigo-400 bg-white px-1">目標</span>
        </div>
        {/* Bars */}
        <div className="absolute inset-0 flex items-end gap-1">
          {data.map((d) => {
            const heightPct = (d.calories / maxCal) * 100;
            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center justify-end h-full">
                <div
                  className={`w-full rounded-t ${getColor(d.calories)} transition-all`}
                  style={{ height: `${heightPct}%` }}
                  title={`${d.dateStr}: ${d.calories} kcal`}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-1 mt-1">
        {data.map((d) => (
          <div key={d.dateStr} className="flex-1 text-center text-[9px] text-gray-400">
            {format(d.date, 'd')}
          </div>
        ))}
      </div>
    </div>
  );
}
