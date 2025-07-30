
"use client";

import { Apple, Beef, Bone, Cookie, CookingPot, Droplets, Leaf, ShieldCheck, Wind } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Meal } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format, isToday } from "date-fns";

interface MealListProps {
  meals: Meal[];
  date: Date;
}

export function MealList({ meals, date }: MealListProps) {
  const dateLabel = isToday(date) ? "Today's Meals" : "Meals for " + format(date, "MMMM d");
  
  if (meals.length === 0) {
    return (
      <Card className="flex h-full min-h-[300px] items-center justify-center shadow-sm">
        <div className="text-center">
          <p className="text-lg font-semibold">No meals logged for this day</p>
          <p className="text-sm text-muted-foreground">Log a meal or select another date.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline">{dateLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] pr-4">
          <Accordion type="multiple" className="w-full space-y-4">
            {meals.map((meal) => (
              <AccordionItem key={meal.id} value={meal.id} className="rounded-lg border bg-card p-4">
                 <div className="mb-2 flex items-start justify-between">
                    <div>
                        <p className="font-semibold">{meal.description}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <div className="flex items-center gap-2"><CookingPot className="h-4 w-4 text-red-500" /> Calories: {meal.calories.toFixed(0)}</div>
                  <div className="flex items-center gap-2"><Beef className="h-4 w-4 text-blue-500" /> Protein: {meal.protein.toFixed(0)}g</div>
                  <div className="flex items-center gap-2"><Apple className="h-4 w-4 text-yellow-500" /> Carbs: {meal.carbs.toFixed(0)}g</div>
                  <div className="flex items-center gap-2"><Cookie className="h-4 w-4 text-purple-500" /> Fats: {meal.fats.toFixed(0)}g</div>
                </div>
                
                <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline">Show More</AccordionTrigger>
                
                <AccordionContent>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                    <div className="flex items-center gap-2"><Bone className="h-4 w-4 text-gray-400" /> Calcium: {(meal.calcium || 0).toFixed(1)}mg</div>
                    <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-red-700" /> Iron: {(meal.iron || 0).toFixed(1)}mg</div>
                    <div className="flex items-center gap-2"><Wind className="h-4 w-4 text-green-500" /> Potassium: {(meal.potassium || 0).toFixed(1)}mg</div>
                    <div className="flex items-center gap-2"><Leaf className="h-4 w-4 text-orange-500" /> Vitamin C: {(meal.vitaminC || 0).toFixed(1)}mg</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-yellow-400" /> Vitamin D: {(meal.vitaminD || 0).toFixed(1)}mcg</div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {meal.ingredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary">
                        {ingredient}
                      </Badge>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
