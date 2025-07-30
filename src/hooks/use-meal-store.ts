
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Meal } from "@/lib/types";

const STORE_KEY = "nutritrack-meals";

interface MealStoreState {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  isInitialized: () => boolean;
}

export const useMealStore = create<MealStoreState>()(
  persist(
    (set, get) => ({
      meals: [],
      addMeal: (meal: Meal) =>
        set((state) => ({
          meals: [...state.meals, meal].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),
      isInitialized: () => get().meals.length > 0 || localStorage.getItem(STORE_KEY) !== null,
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
