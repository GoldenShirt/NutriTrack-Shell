"use client";

import { Apple, Beef, Bone, Cookie, CookingPot, Droplets, Leaf, ShieldCheck, Wind, ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { DailyGoals, Meal } from "@/lib/types";
import { useMemo, useState, useCallback, useRef, type TouchEvent } from "react";
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
  const [isToggling, setIsToggling] = useState(false);
  const leftButtonRef = useRef<HTMLButtonElement>(null);
  const rightButtonRef = useRef<HTMLButtonElement>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  }, []);

  const toggleView = useCallback((shouldBlurButtons: boolean = false) => {
    if (isToggling) return;
    setIsToggling(true);
    setView(v => v === 'macros' ? 'micros' : 'macros');

    // Only blur buttons if explicitly requested (button clicks, not swipes)
    if (shouldBlurButtons) {
      setTimeout(() => {
        leftButtonRef.current?.blur();
        rightButtonRef.current?.blur();
      }, 50);
    }

    // Reset toggle lock after animation completes
    setTimeout(() => setIsToggling(false), 300);
  }, [isToggling]);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartX || !touchEndX || isToggling) return;

    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      // Don't blur buttons when swiping
      toggleView(false);
    }

    setTouchStartX(null);
    setTouchEndX(null);
  }, [touchStartX, touchEndX, isToggling, toggleView]);

  // Simple button handler that prevents default and manages focus properly
  const handleButtonClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isToggling) return;

    // Blur buttons when clicking them directly
    toggleView(true);
  }, [isToggling, toggleView]);

  // Touch handler for mobile button taps
  const handleButtonTouch = useCallback((e: React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isToggling) return;

    // Blur buttons when tapping them directly
    toggleView(true);
  }, [isToggling, toggleView]);

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

  const macroStats = useMemo(() => [
    { title: "Calories", value: summary.calories, goal: goals.calories, unit: "kcal", icon: CookingPot, color: "text-red-500" },
    { title: "Protein", value: summary.protein, goal: goals.protein, unit: "g", icon: Beef, color: "text-blue-500" },
    { title: "Carbs", value: summary.carbs, goal: goals.carbs, unit: "g", icon: Apple, color: "text-yellow-500" },
    { title: "Fats", value: summary.fats, goal: goals.fats, unit: "g", icon: Cookie, color: "text-purple-500" },
  ], [summary, goals]);

  const microStats = useMemo(() => [
    { title: "Calcium", value: summary.calcium, goal: goals.calcium, unit: "mg", icon: Bone, color: "text-gray-400" },
    { title: "Iron", value: summary.iron, goal: goals.iron, unit: "mg", icon: Droplets, color: "text-red-700" },
    { title: "Potassium", value: summary.potassium, goal: goals.potassium, unit: "mg", icon: Wind, color: "text-green-500" },
    { title: "Vitamin C", value: summary.vitaminC, goal: goals.vitaminC, unit: "mg", icon: Leaf, color: "text-orange-500" },
    { title: "Vitamin D", value: summary.vitaminD, goal: goals.vitaminD, unit: "mcg", icon: ShieldCheck, color: "text-yellow-400" },
  ], [summary, goals]);

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
        <div key={stat.title} className={cn({
            "col-span-2 sm:col-span-1": index === 2 && microStats.length === 5,
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
    <div
      className="w-full relative group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div key={view} className="animate-fade-in">
        {view === 'macros' ? renderMacros() : renderMicros()}
      </div>

      <Button
        ref={leftButtonRef}
        variant="outline"
        size="icon"
        onClick={handleButtonClick}
        onTouchEnd={handleButtonTouch}
        disabled={isToggling}
        className="nav-button-left show-on-hover always-visible sm:show-on-hover touch-friendly-button"
        aria-label={`Switch to ${view === 'macros' ? 'micronutrients' : 'macronutrients'} view`}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      <Button
        ref={rightButtonRef}
        variant="outline"
        size="icon"
        onClick={handleButtonClick}
        onTouchEnd={handleButtonTouch}
        disabled={isToggling}
        className="nav-button-right show-on-hover always-visible sm:show-on-hover touch-friendly-button"
        aria-label={`Switch to ${view === 'macros' ? 'micronutrients' : 'macronutrients'} view`}
      >
          <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}