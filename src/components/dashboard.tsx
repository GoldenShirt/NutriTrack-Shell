
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useMealStore } from "@/hooks/use-meal-store";
import { MealList } from "@/components/meal-list";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Settings, ArrowLeft, ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { useUserStore } from "@/hooks/use-user-store";
import { calculateGoalsAction } from "@/app/actions";
import { DEFAULT_GOALS } from "@/lib/constants";
import type { DailyGoals, UserPreferences } from "@/lib/types";
import { format, isToday } from "date-fns";

const NutritionChat = dynamic(() => import('@/components/nutrition-chat').then(mod => mod.NutritionChat), {
  ssr: false,
  loading: () => <div className="p-4 space-y-4">
    <div className="flex items-start gap-3 justify-start">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-12 w-48 rounded-lg" />
    </div>
    <div className="flex items-start gap-3 justify-end">
        <Skeleton className="h-12 w-48 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  </div>
});

const PreferencesForm = dynamic(() => import('./preferences-form').then(mod => mod.PreferencesForm), {
  ssr: false,
  loading: () => <div className="space-y-4 p-1">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-10 w-24 self-end" />
    </div>
});

const DailySummary = dynamic(() => import('@/components/daily-summary').then(mod => mod.DailySummary), {
    ssr: false,
    loading: () => <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-1">
        <Skeleton className="h-[125px]" />
        <Skeleton className="h-[125px]" />
        <Skeleton className="h-[125px]" />
        <Skeleton className="h-[125px]" />
    </div>
});


export function Dashboard() {
  const { meals } = useMealStore();
  const { preferences, isInitialized: isUserInitialized, savePreferences } = useUserStore();
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>(DEFAULT_GOALS);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };
  
  const handleBackToToday = () => {
      setCurrentDate(new Date());
  }

  const selectedDateStr = format(currentDate, "yyyy-MM-dd");

  const mealsForSelectedDate = meals.filter(
    (meal) => format(new Date(meal.date), "yyyy-MM-dd") === selectedDateStr
  );

  const getGoals = useCallback(async () => {
    if (isUserInitialized) {
      setIsLoadingGoals(true);
      try {
        if(preferences.age && preferences.weight && preferences.height && preferences.sex && preferences.activityLevel) {
          const goals = await calculateGoalsAction({
            age: preferences.age,
            weight: preferences.weight,
            height: preferences.height,
            sex: preferences.sex,
            activityLevel: preferences.activityLevel,
            healthGoals: preferences.healthGoals
          });
          setDailyGoals(goals);
        } else {
          setDailyGoals(DEFAULT_GOALS);
        }
      } catch (error) {
        console.error("Failed to calculate goals", error);
        setDailyGoals(DEFAULT_GOALS);
      } finally {
        setIsLoadingGoals(false);
      }
    }
  }, [isUserInitialized, preferences]);

  useEffect(() => {
    getGoals();
  }, [getGoals]);

  const handlePreferencesSave = (newPreferences: UserPreferences) => {
    savePreferences(newPreferences);
    setIsPreferencesOpen(false);
  };
  
  useEffect(() => {
    if (isUserInitialized) {
      getGoals();
    }
  }, [isUserInitialized, preferences, getGoals]);


  if (!isMounted || !isUserInitialized) {
    return (
      <div className="space-y-4 p-4 md:p-0">
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-10 w-10" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
           <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }
  
  const isViewingToday = isToday(currentDate);

  return (
    <div className="grid auto-rows-max items-start gap-4 lg:col-span-2">
      <div className="flex justify-between gap-2">
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
        <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
          <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-14 w-14 flex-shrink-0">
                  <Settings className="h-6 w-6" />
                  <span className="sr-only">Preferences</span>
              </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Your Preferences</DialogTitle>
              </DialogHeader>
              <PreferencesForm currentPreferences={preferences} onSave={handlePreferencesSave} />
          </DialogContent>
        </Dialog>
      </div>

       <div className="grid gap-4">
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePreviousDay}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center font-headline text-lg">
              {format(currentDate, "eeee, MMMM d")}
          </div>
          <Button variant="outline" size="icon" onClick={handleNextDay} disabled={isViewingToday}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          {!isViewingToday && (
              <Button variant="outline" onClick={handleBackToToday} className="h-10">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Today
              </Button>
          )}
        </div>

        {isLoadingGoals ? (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-[125px]" />
                <Skeleton className="h-[125px]" />
                <Skeleton className="h-[125px]" />
                <Skeleton className="h-[125px]" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <div className="grid gap-2">
            <DailySummary meals={mealsForSelectedDate} goals={dailyGoals} />
            <MealList meals={mealsForSelectedDate} date={currentDate} />
          </div>
        )}
      </div>
    </div>
  );
}
