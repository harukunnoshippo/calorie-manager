import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  subDays,
  parseISO,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { useWeightLogs, useWeightGoal, saveWeightLog, deleteWeightLog } from '../hooks/useWeightLogs';

const WEEK_DAYS = ['日', '月', '火', '水', '木', '金', '土'];

export function WeightPage() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalInput, setModalInput] = useState('');
  const [todayInput, setTodayInput] = useState('');

  const weightLogs = useWeightLogs();
  const weightGoal = useWeightGoal();

  const weightMap = useMemo(
    () => new Map(weightLogs.map((l) => [l.date, l.weight])),
    [weightLogs]
  );

  const todayWeight = weightMap.get(today);

  // Chart: all recorded data (last 90 days max)
  const cutoff = format(subDays(new Date(), 89), 'yyyy-MM-dd');
  const chartData = weightLogs
    .filter((l) => l.date >= cutoff)
    .map((l) => ({ date: l.date.slice(5).replace('-', '/'), weight: l.weight }));

  // Calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart); // 0=Sun

  const openModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setModalInput(weightMap.has(dateStr) ? String(weightMap.get(dateStr)) : '');
  };

  const handleModalSave = async () => {
    if (!selectedDate) return;
    const val = parseFloat(modalInput);
    if (isNaN(val) || val <= 0 || val > 300) return;
    await saveWeightLog(selectedDate, Math.round(val * 10) / 10);
    setSelectedDate(null);
  };

  const handleModalDelete = async () => {
    if (!selectedDate) return;
    await deleteWeightLog(selectedDate);
    setSelectedDate(null);
  };

  const handleTodaySave = async () => {
    const val = parseFloat(todayInput);
    if (isNaN(val) || val <= 0 || val > 300) return;
    await saveWeightLog(today, Math.round(val * 10) / 10);
    setTodayInput('');
  };

  // Y-axis domain: tight around actual data
  const weights = chartData.map((d) => d.weight);
  const yMin = weights.length ? Math.floor(Math.min(...weights) - 1) : 40;
  const yMax = weights.length ? Math.ceil(Math.max(...weights) + 1) : 100;

  return (
    <div className="flex-1 pb-20">
      <div className="px-5 pt-5 pb-4 space-y-4">

        {/* Today's quick input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">今日の体重</span>
            <span className="text-xs text-gray-400">
              {format(new Date(), 'M月d日 (E)', { locale: ja })}
            </span>
          </div>
          {todayWeight !== undefined ? (
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-indigo-600">{todayWeight}</span>
              <span className="text-gray-400 text-lg">kg</span>
              <button
                onClick={() => openModal(today)}
                className="ml-auto text-xs text-indigo-500 font-medium px-3 py-1.5 rounded-lg border border-indigo-200 active:bg-indigo-50"
              >
                編集
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="00.0"
                value={todayInput}
                onChange={(e) => setTodayInput(e.target.value)}
                className="w-28 px-3 py-2.5 border border-gray-200 rounded-xl text-center text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="text-gray-400">kg</span>
              <button
                onClick={handleTodaySave}
                disabled={!todayInput.trim()}
                className="ml-auto px-5 py-2.5 bg-indigo-500 text-white text-sm font-medium rounded-xl disabled:opacity-40 active:bg-indigo-600"
              >
                記録する
              </button>
            </div>
          )}
          {weightGoal && (
            <p className="text-xs text-gray-400 mt-2">
              目標: {weightGoal.targetKg} kg
              {todayWeight !== undefined && (
                <span className={todayWeight <= weightGoal.targetKg ? ' text-emerald-500 font-medium' : ''}>
                  {' '}（あと {(todayWeight - weightGoal.targetKg).toFixed(1)} kg）
                </span>
              )}
            </p>
          )}
        </div>

        {/* Trend chart */}
        {chartData.length >= 2 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">体重推移</span>
              <span className="text-xs text-gray-400">直近90日</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  interval="preserveStartEnd"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[yMin, yMax]}
                  tick={{ fontSize: 9, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  tickFormatter={(v) => `${v}kg`}
                />
                <Tooltip
                  formatter={(val) => [`${val} kg`, '体重']}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  labelStyle={{ color: '#6b7280' }}
                />
                {weightGoal && (
                  <ReferenceLine
                    y={weightGoal.targetKg}
                    stroke="#6366f1"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{ value: `目標 ${weightGoal.targetKg}kg`, position: 'right', fontSize: 9, fill: '#6366f1' }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly calendar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 text-gray-400 active:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <span className="text-sm font-semibold text-gray-700">
              {format(currentMonth, 'yyyy年M月', { locale: ja })}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 text-gray-400 active:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Week headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs font-medium py-1 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: startPadding }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const dayOfWeek = getDay(day);
              const weight = weightMap.get(dateStr);
              const isToday = dateStr === today;
              const isFuture = dateStr > today;

              return (
                <button
                  key={dateStr}
                  onClick={() => !isFuture && openModal(dateStr)}
                  disabled={isFuture}
                  className={`flex flex-col items-center py-1.5 rounded-xl transition ${
                    isToday
                      ? 'bg-indigo-500'
                      : weight !== undefined
                      ? 'bg-indigo-50 active:bg-indigo-100'
                      : 'active:bg-gray-50'
                  } ${isFuture ? 'opacity-25' : ''}`}
                >
                  <span
                    className={`text-xs leading-none ${
                      isToday
                        ? 'text-white font-bold'
                        : dayOfWeek === 0
                        ? 'text-red-400'
                        : dayOfWeek === 6
                        ? 'text-blue-400'
                        : 'text-gray-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {weight !== undefined && (
                    <span
                      className={`text-[9px] font-medium leading-tight mt-0.5 ${
                        isToday ? 'text-indigo-100' : 'text-indigo-500'
                      }`}
                    >
                      {weight}
                    </span>
                  )}
                  {weight === undefined && !isFuture && (
                    <span className="text-[9px] text-gray-300 leading-tight mt-0.5">—</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weight input modal (bottom sheet) */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedDate(null)} />
          <div className="relative bg-white rounded-t-2xl px-5 pt-5 pb-8">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-800 text-center mb-5">
              {format(parseISO(selectedDate), 'M月d日 (E)', { locale: ja })} の体重
            </h3>
            <div className="flex items-center justify-center gap-3 mb-6">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                placeholder="00.0"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                autoFocus
                className="w-36 px-4 py-3 border border-gray-200 rounded-xl text-center text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="text-gray-400 text-lg">kg</span>
            </div>
            <div className="flex gap-2">
              {weightMap.has(selectedDate) && (
                <button
                  onClick={handleModalDelete}
                  className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium active:bg-red-50"
                >
                  削除
                </button>
              )}
              <button
                onClick={() => setSelectedDate(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium active:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleModalSave}
                disabled={!modalInput.trim() || isNaN(parseFloat(modalInput))}
                className="flex-1 py-3 rounded-xl bg-indigo-500 text-white text-sm font-medium disabled:opacity-40 active:bg-indigo-600"
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
