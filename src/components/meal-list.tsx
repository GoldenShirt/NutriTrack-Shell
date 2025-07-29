"use client";

import { Apple, Beef, Cookie, CookingPot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Meal } from "@/lib/types";

interface MealListProps {
  meals: Meal[];
}

const nutrientIcons = {
  calories: CookingPot,
  protein: Beef,
  carbs: Apple,
  fats: Cookie,
};

export function MealList({ meals }: MealListProps) {
  if (meals.length === 0) {
    return (
      <Card className="flex h-full min-h-[300px] items-center justify-center shadow-sm">
        <div className="text-center">
          <p className="text-lg font-semibold">No meals logged today</p>
          <p className="text-sm text-muted-foreground">Log your first meal to get started!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline">Today's Meals</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] pr-4">
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.id} className="rounded-lg border bg-card p-4">
                <div className="mb-2 flex items-start justify-between">
                    <div>
                        <p className="font-semibold">{meal.description}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <div className="flex items-center gap-2"><nutrientIcons.calories className="h-4 w-4 text-red-500" /> Calories: {meal.calories.toFixed(0)}</div>
                  <div className="flex items-center gap-2"><nutrientIcons.protein className="h-4 w-4 text-blue-500" /> Protein: {meal.protein.toFixed(0)}g</div>
                  <div className="flex items-center gap-2"><nutrientIcons.carbs className="h-4 w-4 text-yellow-500" /> Carbs: {meal.carbs.toFixed(0)}g</div>
                  <div className="flex items-center gap-2"><nutrientIcons.fats className="h-4 w-4 text-purple-500" /> Fats: {meal.fats.toFixed(0)}g</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {meal.ingredients.map((ingredient) => (
                    <Badge key={ingredient} variant="secondary">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
