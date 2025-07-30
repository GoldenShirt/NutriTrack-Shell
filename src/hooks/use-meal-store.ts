"use client";

import { useState, useEffect, useCallback } from "react";
import type { Meal } from "@/lib/types";

const STORE_KEY = "nutritrack-meals";

let meals: Meal[] = [];
let listeners: React.Dispatch<React.SetStateAction<Meal[]>>[] = [];

const setMeals = (newMeals: Meal[] | ((prev: Meal[]) => Meal[])) => {
  if (typeof newMeals === 'function') {
    meals = newMeals(meals);
  } else {
    meals = newMeals;
  }
  
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(meals));
  } catch (error) {
    console.error("Failed to save meals to localStorage", error);
  }

  listeners.forEach((listener) => {
    listener(meals);
  });
};


try {
  const storedMeals = localStorage.getItem(STORE_KEY);
  if (storedMeals) {
    meals = JSON.parse(storedMeals);
  }
} catch (error) {
  console.error("Failed to load meals from localStorage", error);
}

export function useMealStore() {
  const [localMeals, setLocalMeals] = useState(meals);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // The store is initialized synchronously above, but we use this to signal readiness
    setIsInitialized(true);
    
    listeners.push(setLocalMeals);
    return () => {
      listeners = listeners.filter(l => l !== setLocalMeals);
    };
  }, []);


  const addMeal = useCallback((meal: Meal) => {
    setMeals((prevMeals) => 
      [...prevMeals, meal].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);

  return { meals: localMeals, addMeal, isInitialized };
}
