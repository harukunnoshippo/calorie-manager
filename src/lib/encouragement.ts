import type { BadgeStats } from './badges';

export function getEncouragementMessage(stats: BadgeStats): { emoji: string; message: string } {
  if (stats.currentStreak >= 30) {
    return { emoji: '👑', message: `${stats.currentStreak}日連続記録中！もう習慣そのものです` };
  }
  if (stats.currentStreak >= 7) {
    return { emoji: '🔥', message: `${stats.currentStreak}日連続記録中！素晴らしい習慣です` };
  }
  if (stats.fatKgReduced >= 3) {
    return { emoji: '🏆', message: `累計-${stats.fatKgReduced.toFixed(2)}kg！見た目に変化が出る頃です` };
  }
  if (stats.fatKgReduced >= 1) {
    return { emoji: '💪', message: `累計-${stats.fatKgReduced.toFixed(2)}kg！服が緩くなる頃です` };
  }
  if (stats.currentStreak >= 3) {
    return { emoji: '⭐', message: `${stats.currentStreak}日連続記録中！この調子です` };
  }
  if (stats.totalDays >= 1) {
    return { emoji: '🌱', message: `記録を始めるあなたを応援しています` };
  }
  return { emoji: '✨', message: `今日から始めましょう` };
}
