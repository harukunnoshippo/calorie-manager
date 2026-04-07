export interface BadgeStats {
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  goalAchievedDays: number;
  fatKgReduced: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  check: (stats: BadgeStats) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-record', name: '最初の一歩', emoji: '🌱', description: '初めて記録した', check: (s) => s.totalDays >= 1 },
  { id: 'streak-3', name: '3日坊主突破', emoji: '🔥', description: '3日連続記録', check: (s) => s.longestStreak >= 3 },
  { id: 'streak-7', name: '一週間継続', emoji: '⭐', description: '7日連続記録', check: (s) => s.longestStreak >= 7 },
  { id: 'streak-30', name: '一ヶ月マスター', emoji: '👑', description: '30日連続記録', check: (s) => s.longestStreak >= 30 },
  { id: 'goal-10', name: '目標達成10日', emoji: '🎯', description: '目標カロリー以内10日', check: (s) => s.goalAchievedDays >= 10 },
  { id: 'fat-1kg', name: '-1kg達成', emoji: '💪', description: '理論上1kg減少', check: (s) => s.fatKgReduced >= 1 },
  { id: 'fat-3kg', name: '-3kg達成', emoji: '🏆', description: '理論上3kg減少', check: (s) => s.fatKgReduced >= 3 },
  { id: 'fat-5kg', name: '-5kg達成', emoji: '✨', description: '理論上5kg減少', check: (s) => s.fatKgReduced >= 5 },
];
