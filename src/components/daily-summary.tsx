
"use client";

import { Apple, Beef, Bone, Cookie, CookingPot, Droplets, Leaf, ShieldCheck, Wind, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DailyGoals, Meal } from "@/lib/types";
import { useMemo, useState, type TouchEvent, type MouseEvent } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface DailySummaryProps {
  meals: Meal[];
  goals: DailyGoals;
}

export function DailySummary({ meals, goals }: DailySummaryProps) {
  const [view, setView] = useState<'macros' | 'micros'>('macros');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEndX(null); 
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  
  const toggleView = () => {
    setView(v => v === 'macros' ? 'micros' : 'macros');
  }
  
  const handleToggleClick = (e: MouseEvent<HTMLButtonElement>) => {
    toggleView();
    e.currentTarget.blur();
  }

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      toggleView();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };


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
  

  const renderMacros = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-1">
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
  );

  const renderMicros = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-4 p-1">
      {microStats.map((stat, index) => (
         <div key={stat.title} className={cn("w-full", {
            "col-span-2 sm:col-span-1 sm:col-start-2 md:col-start-auto lg:col-start-auto": index === 2 && microStats.length === 5,
            "sm:col-start-1 md:col-start-auto": index === 3 && microStats.length === 5
         })}>
          <Card className="shadow-sm w-full h-full">
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
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full relative group" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div key={view} className="animate-fade-in">
        {view === 'macros' ? renderMacros() : renderMicros()}
      </div>

      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleToggleClick}
        onTouchCancel={(e) => (e.target as HTMLElement).blur()}
        className={cn(
            "absolute -left-3 top-1/2 -translate-y-1/2 z-10 transition-opacity opacity-0 group-hover:opacity-100 sm:opacity-100"
        )}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleToggleClick} 
        onTouchCancel={(e) => (e.target as HTMLElement).blur()}
        className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 z-10 transition-opacity opacity-0 group-hover:opacity-100 sm:opacity-100"
        )}
      >
          <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
