
"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Meal } from "@/lib/types";

const STORE_KEY = "nutritrack-meals";

interface MealStoreState {
  meals: Meal[];
  isInitialized: boolean;
  addMeal: (meal: Meal) => void;
  _setIsInitialized: (isInitialized: boolean) => void;
}

export const useMealStore = create<MealStoreState>()(
  persist(
    (set) => ({
      meals: [],
      isInitialized: false,
      addMeal: (meal: Meal) =>
        set((state) => ({
          meals: [...state.meals, meal].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        })),
      _setIsInitialized: (isInitialized: boolean) => set({ isInitialized }),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._setIsInitialized(true);
        }
      },
    }
  )
);

// This is a bit of a workaround to ensure the store is initialized on the client-side
// before any components that use it are rendered.
if (typeof window !== 'undefined') {
  useMealStore.getState()._setIsInitialized(true);
}
