"use client";

import { useMealStore } from "@/hooks/use-meal-store";
import { DailySummary } from "@/components/daily-summary";
import { MealList } from "@/components/meal-list";
import { Skeleton } from "@/components/ui/skeleton";
import { NutritionChat } from "@/components/nutrition-chat";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Bot } from "lucide-react";

export function Dashboard() {
  const { meals, isInitialized } = useMealStore();

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
        <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
            <AccordionItem value="item-1" className="border-b-0">
                <Card className="shadow-sm">
                    <AccordionTrigger className="p-6 font-headline text-xl hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Bot className="h-6 w-6 text-primary" />
                          <span>AI Nutrition Coach</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2">
                      <div className="h-[500px] border-t">
                        <NutritionChat />
                      </div>
                    </AccordionContent>
                </Card>
            </AccordionItem>
        </Accordion>

      <DailySummary meals={todaysMeals} />
      <div className="grid gap-4">
          <MealList meals={todaysMeals} />
      </div>
    </div>
  );
}
