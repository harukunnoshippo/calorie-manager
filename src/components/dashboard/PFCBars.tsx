interface PFCBarProps {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  unit?: string;
}

function PFCBar({ label, consumed, goal, color, unit = 'g' }: PFCBarProps) {
  const percentage = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
  const remaining = goal - consumed;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-500">
          {consumed.toFixed(1)} / {goal}{unit}
        </span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-right">
        <span className={`text-xs font-medium ${remaining >= 0 ? 'text-gray-500' : 'text-red-500'}`}>
          {remaining >= 0 ? `あと ${remaining.toFixed(1)}${unit}` : `${Math.abs(remaining).toFixed(1)}${unit} 超過`}
        </span>
      </div>
    </div>
  );
}

interface Props {
  protein: number;
  fat: number;
  carbs: number;
  goalProtein: number;
  goalFat: number;
  goalCarbs: number;
}

export function PFCBars({ protein, fat, carbs, goalProtein, goalFat, goalCarbs }: Props) {
  return (
    <div className="space-y-3">
      <PFCBar label="たんぱく質 (P)" consumed={protein} goal={goalProtein} color="#3b82f6" />
      <PFCBar label="脂質 (F)" consumed={fat} goal={goalFat} color="#f59e0b" />
      <PFCBar label="炭水化物 (C)" consumed={carbs} goal={goalCarbs} color="#22c55e" />
    </div>
  );
}
