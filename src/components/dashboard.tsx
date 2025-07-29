"use client";

import { useMealStore } from "@/hooks/use-meal-store";
import { DailySummary } from "@/components/daily-summary";
import { MealLogger } from "@/components/meal-logger";
import { MealList } from "@/components/meal-list";
import { Skeleton } from "@/components/ui/skeleton";

export function Dashboard() {
  const { meals, addMeal, isInitialized } = useMealStore();

  const today = new Date().toISOString().split("T")[0];
  const todaysMeals = meals.filter(
    (meal) => meal.date.split("T")[0] === today
  );

  if (!isInitialized) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
         <Skeleton className="h-32" />
         <Skeleton className="h-32" />
         <Skeleton className="h-32" />
         <Skeleton className="h-32" />
      </div>
    )
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <DailySummary meals={todaysMeals} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        <div className="lg:col-span-1 xl:col-span-1">
          <MealLogger onMealAdded={addMeal} />
        </div>
        <div className="lg:col-span-1 xl:col-span-2">
          <MealList meals={todaysMeals} />
        </div>
      </div>
    </div>
  );
}
