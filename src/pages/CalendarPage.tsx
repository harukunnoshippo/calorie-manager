import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, subMonths, addMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { db } from '../lib/db';
import { useCurrentGoal } from '../hooks/useGoals';
import { useFatReduction } from '../hooks/useFatReduction';
import { DEFAULT_GOAL } from '../types';
import { useNavigate } from 'react-router-dom';

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const goal = useCurrentGoal() ?? { id: 'default', effectiveFrom: '2000-01-01', ...DEFAULT_GOAL };
  const fatReduction = useFatReduction();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const startStr = format(calStart, 'yyyy-MM-dd');
  const endStr = format(calEnd, 'yyyy-MM-dd');

  const meals = useLiveQuery(
    () => db.meals.where('date').between(startStr, endStr, true, true).toArray(),
    [startStr, endStr],
    []
  );

  const dailyTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const meal of meals) {
      map.set(meal.date, (map.get(meal.date) ?? 0) + meal.calories);
    }
    return map;
  }, [meals]);

  const getColor = (dateStr: string) => {
    const total = dailyTotals.get(dateStr);
    if (total === undefined) return 'bg-gray-100';
    const ratio = total / goal.calories;
    if (ratio <= 1.0) return 'bg-green-300';
    if (ratio <= 1.15) return 'bg-yellow-300';
    return 'bg-red-300';
  };

  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <div className="flex-1 pb-20">
      <div className="flex items-center justify-between px-5 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
          </svg>
        </button>
        <span className="text-base font-semibold text-gray-800">
          {format(currentMonth, 'yyyy年M月', { locale: ja })}
        </span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="px-4 py-4">
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-300" />目標内</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-300" />やや超過</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-300" />大幅超過</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-100" />未記録</span>
        </div>

        {/* Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);
            const total = dailyTotals.get(dateStr);

            return (
              <button
                key={dateStr}
                onClick={() => navigate(`/?date=${dateStr}`)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition ${
                  inMonth ? '' : 'opacity-30'
                } ${getColor(dateStr)} ${today ? 'ring-2 ring-indigo-500' : ''}`}
              >
                <span className={`font-medium ${inMonth ? 'text-gray-700' : 'text-gray-400'}`}>
                  {format(day, 'd')}
                </span>
                {total !== undefined && (
                  <span className="text-[10px] text-gray-600 mt-0.5">{total}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Monthly Summary */}
        <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">月間サマリー</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-400">記録日数</p>
              <p className="text-lg font-bold text-gray-800">{dailyTotals.size}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">平均カロリー</p>
              <p className="text-lg font-bold text-indigo-600">
                {dailyTotals.size > 0
                  ? Math.round([...dailyTotals.values()].reduce((a, b) => a + b, 0) / dailyTotals.size)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">目標達成日</p>
              <p className="text-lg font-bold text-green-600">
                {[...dailyTotals.values()].filter((v) => v <= goal.calories).length}
              </p>
            </div>
          </div>
        </div>

        {/* Fat Reduction Simulation */}
        {fatReduction.daysTracked > 0 && (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-bold text-gray-700">体脂肪減少シミュレーション</span>
              <span className="text-xs text-gray-400">（昨日まで）</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className={`text-3xl font-bold ${fatReduction.fatKg >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {fatReduction.fatKg >= 0 ? '-' : '+'}{Math.abs(fatReduction.fatKg).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">kg</span>
            </div>
            <div className="flex gap-4 text-xs text-gray-400">
              <span>累積{fatReduction.cumulativeDeficit >= 0 ? '赤字' : '黒字'}: {Math.abs(fatReduction.cumulativeDeficit).toLocaleString()} kcal</span>
              <span>記録日数: {fatReduction.daysTracked}日</span>
            </div>
            <p className="text-[10px] text-gray-300 mt-2">基礎代謝 2,500 kcal / 体脂肪1kg = 7,200 kcal で計算</p>
          </div>
        )}
      </div>
    </div>
  );
}
