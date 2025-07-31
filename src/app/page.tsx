
"use client";

import { useState } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Icons } from "@/components/icons";
import { Dashboard } from "@/components/dashboard";
import type { Meal } from "@/lib/types";
import { MealLogger } from "@/components/meal-logger";

export default function Home() {
  const [isLogMealOpen, setIsLogMealOpen] = useState(false);

  const handleMealAdded = (meal: Meal) => {
    // The meal is already added to the store optimistically in MealLogger
    setIsLogMealOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold">NutriTrack</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Dashboard />
      </main>
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
    </div>
  );
}
