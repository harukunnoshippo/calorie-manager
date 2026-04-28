import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns';
import { useCurrentGoal } from './useGoals';
import { DEFAULT_GOAL } from '../types';
import type { BadgeStats } from '../lib/badges';

const TDEE = 2000;
const KCAL_PER_KG_FAT = 7200;

const EMPTY: BadgeStats = {
  totalDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  goalAchievedDays: 0,
  fatKgReduced: 0,
};

export function useBadgeStats(): BadgeStats {
  const goal = useCurrentGoal();
  const goalCalories = goal?.calories ?? DEFAULT_GOAL.calories;

  const stats = useLiveQuery(async () => {
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const meals = await db.meals.where('date').belowOrEqual(yesterday).toArray();

    if (meals.length === 0) return EMPTY;

    const dailyCalories = new Map<string, number>();
    for (const meal of meals) {
      dailyCalories.set(meal.date, (dailyCalories.get(meal.date) || 0) + meal.calories);
    }

    const sortedDates = [...dailyCalories.keys()].sort();
    const totalDays = sortedDates.length;

    // Goal achieved days
    let goalAchievedDays = 0;
    for (const cal of dailyCalories.values()) {
      if (cal <= goalCalories) goalAchievedDays += 1;
    }

    // Longest streak
    let longestStreak = 1;
    let runningStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = differenceInCalendarDays(parseISO(sortedDates[i]), parseISO(sortedDates[i - 1]));
      if (diff === 1) {
        runningStreak += 1;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
      } else {
        runningStreak = 1;
      }
    }

    // Current streak (counting back from yesterday)
    let currentStreak = 0;
    let cursor = yesterday;
    while (dailyCalories.has(cursor)) {
      currentStreak += 1;
      cursor = format(subDays(parseISO(cursor), 1), 'yyyy-MM-dd');
    }

    // Cumulative fat reduction
    let cumulativeDeficit = 0;
    for (const cal of dailyCalories.values()) {
      cumulativeDeficit += TDEE - cal;
    }
    const fatKgReduced = cumulativeDeficit / KCAL_PER_KG_FAT;

    return {
      totalDays,
      currentStreak,
      longestStreak,
      goalAchievedDays,
      fatKgReduced,
    };
  }, [goalCalories], EMPTY);

  return stats;
}
