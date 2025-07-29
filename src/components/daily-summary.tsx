"use client";

import { Apple, Beef, Cookie, CookingPot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DAILY_GOALS } from "@/lib/constants";
import type { Meal } from "@/lib/types";

interface DailySummaryProps {
  meals: Meal[];
}

export function DailySummary({ meals }: DailySummaryProps) {
  const summary = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.protein;
      acc.carbs += meal.carbs;
      acc.fats += meal.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const stats = [
    {
      title: "Calories",
      value: summary.calories,
      goal: DAILY_GOALS.calories,
      unit: "kcal",
      icon: CookingPot,
      color: "text-red-500",
    },
    {
      title: "Protein",
      value: summary.protein,
      goal: DAILY_GOALS.protein,
      unit: "g",
      icon: Beef,
      color: "text-blue-500",
    },
    {
      title: "Carbs",
      value: summary.carbs,
      goal: DAILY_GOALS.carbs,
      unit: "g",
      icon: Apple,
      color: "text-yellow-500",
    },
    {
      title: "Fats",
      value: summary.fats,
      goal: DAILY_GOALS.fats,
      unit: "g",
      icon: Cookie,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value.toFixed(0)}
              <span className="text-xs text-muted-foreground">/{stat.goal}{stat.unit}</span>
            </div>
            <Progress value={(stat.value / stat.goal) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
