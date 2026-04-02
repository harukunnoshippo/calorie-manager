import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  consumed: number;
  goal: number;
}

export function DailyProgress({ consumed, goal }: Props) {
  const remaining = Math.max(0, goal - consumed);
  const overAmount = consumed > goal ? consumed - goal : 0;
  const percentage = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
  const isOver = consumed > goal;

  const data = isOver
    ? [{ value: goal }, { value: overAmount }]
    : [{ value: consumed }, { value: remaining }];

  const colors = isOver ? ['#6366f1', '#ef4444'] : ['#6366f1', '#e2e8f0'];

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width={180} height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{consumed}</span>
        <span className="text-xs text-gray-500">/ {goal} kcal</span>
        <span className={`text-sm font-semibold mt-1 ${isOver ? 'text-red-500' : 'text-indigo-500'}`}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
