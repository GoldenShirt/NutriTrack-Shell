
"use client";

import { Apple, Beef, Cookie, CookingPot, Leaf, Droplets, Wind, ShieldCheck, Bone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import type { DailyGoals, Meal } from "@/lib/types";
import { useMemo } from "react";

interface DailySummaryProps {
  meals: Meal[];
  goals: DailyGoals;
}

export function DailySummary({ meals, goals }: DailySummaryProps) {
  const summary = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories;
        acc.protein += meal.protein;
        acc.carbs += meal.carbs;
        acc.fats += meal.fats;
        acc.vitaminC += meal.vitaminC || 0;
        acc.vitaminD += meal.vitaminD || 0;
        acc.iron += meal.iron || 0;
        acc.calcium += meal.calcium || 0;
        acc.potassium += meal.potassium || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0, vitaminC: 0, vitaminD: 0, iron: 0, calcium: 0, potassium: 0 }
    );
  }, [meals]);

  const macroStats = [
    { title: "Calories", value: summary.calories, goal: goals.calories, unit: "kcal", icon: CookingPot, color: "text-red-500" },
    { title: "Protein", value: summary.protein, goal: goals.protein, unit: "g", icon: Beef, color: "text-blue-500" },
    { title: "Carbs", value: summary.carbs, goal: goals.carbs, unit: "g", icon: Apple, color: "text-yellow-500" },
    { title: "Fats", value: summary.fats, goal: goals.fats, unit: "g", icon: Cookie, color: "text-purple-500" },
  ];

  const microStats = [
    { title: "Calcium", value: summary.calcium, goal: goals.calcium, unit: "mg", icon: Bone, color: "text-gray-400" },
    { title: "Iron", value: summary.iron, goal: goals.iron, unit: "mg", icon: Droplets, color: "text-red-700" },
    { title: "Potassium", value: summary.potassium, goal: goals.potassium, unit: "mg", icon: Wind, color: "text-green-500" },
    { title: "Vitamin C", value: summary.vitaminC, goal: goals.vitaminC, unit: "mg", icon: Leaf, color: "text-orange-500" },
    { title: "Vitamin D", value: summary.vitaminD, goal: goals.vitaminD, unit: "mcg", icon: ShieldCheck, color: "text-yellow-400" },
  ];


  return (
    <Carousel opts={{ loop: true }} className="w-full">
      <CarouselContent>
        <CarouselItem>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {macroStats.map((stat) => (
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
                  <Progress value={(stat.goal > 0 ? (stat.value / stat.goal) * 100 : 0)} className="mt-2 h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4">
             {microStats.map((stat) => (
                <Card key={stat.title} className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                    <div className="text-2xl font-bold">
                        {stat.value.toFixed(1)}
                        <span className="text-xs text-muted-foreground">/{stat.goal}{stat.unit}</span>
                    </div>
                    <Progress value={stat.goal > 0 ? (stat.value / stat.goal) * 100 : 0} className="mt-2 h-2" />
                    </CardContent>
                </Card>
            ))}
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
