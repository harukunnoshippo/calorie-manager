import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { format, subDays } from 'date-fns';

const BMR = 1633;
const KCAL_PER_KG_FAT = 7200;

export function useFatReduction() {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  return useLiveQuery(async () => {
    // Get all meals up to yesterday
    const meals = await db.meals
      .where('date')
      .belowOrEqual(yesterday)
      .toArray();

    if (meals.length === 0) {
      return { cumulativeDeficit: 0, fatKg: 0, daysTracked: 0 };
    }

    // Group calories by date
    const dailyCalories = new Map<string, number>();
    for (const meal of meals) {
      dailyCalories.set(meal.date, (dailyCalories.get(meal.date) || 0) + meal.calories);
    }

    // Calculate cumulative deficit
    let cumulativeDeficit = 0;
    for (const [, calories] of dailyCalories) {
      cumulativeDeficit += BMR - calories;
    }

    return {
      cumulativeDeficit,
      fatKg: cumulativeDeficit / KCAL_PER_KG_FAT,
      daysTracked: dailyCalories.size,
    };
  }, [yesterday], { cumulativeDeficit: 0, fatKg: 0, daysTracked: 0 });
}
