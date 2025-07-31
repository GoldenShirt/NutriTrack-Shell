
"use client";

import { Apple, Beef, Bone, Cookie, CookingPot, Droplets, Leaf, Loader2, ShieldCheck, Trash2, Wind, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Meal } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { useMealStore } from "@/hooks/use-meal-store";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MealListProps {
  meals: Meal[];
  date: Date;
}

export function MealList({ meals, date }: MealListProps) {
  const dateLabel = isToday(date) ? "Today's Meals" : "Meals for " + format(date, "MMMM d");
  const { deleteMeal } = useMealStore();
  
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
      <CardContent className="p-2 md:p-4">
          <Accordion type="multiple" className="w-full space-y-2">
            {meals.map((meal) => (
              <AccordionItem key={meal.id} value={meal.id} className={cn("relative rounded-lg border bg-card p-4 pr-12", (meal.status === 'pending' || meal.status === 'failed') && "opacity-60")}>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-3 right-2 h-7 w-7">
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this meal from your log.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMeal(meal.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                 <div className="mb-2 flex items-start justify-between">
                    <div>
                        <p className="font-semibold">{meal.description}</p>
                        <p className="text-xs text-muted-foreground">
                            {new Date(meal.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    {meal.status === 'pending' && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Analyzing...</span>
                        </div>
                    )}
                    {meal.status === 'failed' && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Analysis Failed</span>
                        </div>
                    )}
                </div>
                
                {meal.status === 'complete' && (
                  <>
                    <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                      <div className="flex items-center gap-2"><CookingPot className="h-4 w-4 text-red-500" /> Calories: {meal.calories.toFixed(0)}</div>
                      <div className="flex items-center gap-2"><Beef className="h-4 w-4 text-blue-500" /> Protein: {meal.protein.toFixed(0)}g</div>
                      <div className="flex items-center gap-2"><Apple className="h-4 w-4 text-yellow-500" /> Carbs: {meal.carbs.toFixed(0)}g</div>
                      <div className="flex items-center gap-2"><Cookie className="h-4 w-4 text-purple-500" /> Fats: {meal.fats.toFixed(0)}g</div>
                    </div>
                    
                    <AccordionTrigger className="p-0 text-xs text-muted-foreground hover:no-underline">Show More</AccordionTrigger>
                    
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
                  </>
                )}
              </AccordionItem>
            ))}
          </Accordion>
      </CardContent>
    </Card>
  );
}
