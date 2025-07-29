"use client";

import { useState } from "react";
import { useMealStore } from "@/hooks/use-meal-store";
import { DailySummary } from "@/components/daily-summary";
import { MealList } from "@/components/meal-list";
import { Skeleton } from "@/components/ui/skeleton";
import { NutritionChat } from "@/components/nutrition-chat";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles } from "lucide-react";

export function Dashboard() {
  const { meals, isInitialized } = useMealStore();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todaysMeals = meals.filter(
    (meal) => meal.date.split("T")[0] === today
  );

  if (!isInitialized) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="h-14 w-full justify-start rounded-lg bg-card px-4 text-left text-muted-foreground shadow-sm hover:bg-card">
            <Sparkles className="mr-3 h-5 w-5 text-primary" />
            Ask your AI nutrition coach...
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl h-[70vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
                <div className="flex items-center gap-2 font-headline text-xl">
                    <Bot className="h-6 w-6 text-primary" />
                    <span>AI Nutrition Coach</span>
                </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden border-t">
            <NutritionChat />
          </div>
        </DialogContent>
      </Dialog>

      <DailySummary meals={todaysMeals} />
      <div className="grid gap-4">
          <MealList meals={todaysMeals} />
      </div>
    </div>
  );
}
