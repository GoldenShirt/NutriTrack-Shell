"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Meal } from "@/lib/types";

const STORE_KEY = "nutritrack-meals";

interface MealStoreState {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  updateMeal: (mealId: string, updates: Partial<Meal>) => void;
  deleteMeal: (mealId: string) => void;
  getMeals: () => Meal[];
}

export const useMealStore = create<MealStoreState>()(
  persist(
    (set, get) => ({
      meals: [],
      addMeal: (meal: Meal) =>
        set((state) => ({
          meals: [...state.meals, meal].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),
      updateMeal: (mealId: string, updates: Partial<Meal>) =>
        set((state) => ({
          meals: state.meals.map((meal) =>
            meal.id === mealId ? { ...meal, ...updates } : meal
          ),
        })),
      deleteMeal: (mealId: string) =>
        set((state) => ({
            meals: state.meals.filter((meal) => meal.id !== mealId),
        })),
      getMeals: () => get().meals,
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
