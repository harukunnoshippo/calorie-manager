export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  category: MealCategory;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  source: 'photo' | 'text' | 'manual';
  photoBlob?: Blob;
  createdAt: number;
  updatedAt: number;
}

export interface DailyGoal {
  id: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  effectiveFrom: string; // YYYY-MM-DD
}

export interface AppSettings {
  id: string;
  claudeApiKey?: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  remainingCalories: number;
  remainingProtein: number;
  remainingFat: number;
  remainingCarbs: number;
  meals: MealEntry[];
}

export interface NutritionResponse {
  name: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface FoodPreset {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  createdAt: number;
}

export const MEAL_CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '間食',
};

export const MEAL_CATEGORIES: MealCategory[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const DEFAULT_GOAL: Omit<DailyGoal, 'id' | 'effectiveFrom'> = {
  calories: 2000,
  protein: 60,
  fat: 55,
  carbs: 300,
};
