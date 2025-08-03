
"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Meal } from "@/lib/types";
import { MealLogger } from "@/components/meal-logger";


export function MealLoggerButton() {
  const [isLogMealOpen, setIsLogMealOpen] = useState(false);

  const handleMealAdded = (meal: Meal) => {
    // The meal is already added to the store optimistically in MealLogger
    setIsLogMealOpen(false);
  };

  return (
    <Dialog open={isLogMealOpen} onOpenChange={setIsLogMealOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
            size="icon"
          >
            <Wand2 className="h-8 w-8" />
            <span className="sr-only">Log a Meal</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
                <div className="flex items-center gap-2 font-headline text-xl">
                    <Wand2 className="h-6 w-6 text-primary" />
                    <span>Log a Meal</span>
                </div>
            </DialogTitle>
          </DialogHeader>
          <MealLogger onMealAdded={handleMealAdded} />
        </DialogContent>
      </Dialog>
  )
}
