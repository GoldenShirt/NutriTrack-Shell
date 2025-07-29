"use client";

import { useState, useEffect, useCallback } from "react";
import type { Meal } from "@/lib/types";

const STORE_KEY = "nutritrack-meals";

export function useMealStore() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedMeals = localStorage.getItem(STORE_KEY);
      if (storedMeals) {
        setMeals(JSON.parse(storedMeals));
      }
    } catch (error) {
      console.error("Failed to load meals from localStorage", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(meals));
      } catch (error) {
        console.error("Failed to save meals to localStorage", error);
      }
    }
  }, [meals, isInitialized]);

  const addMeal = useCallback((meal: Meal) => {
    setMeals((prevMeals) => [...prevMeals, meal].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  return { meals, addMeal, isInitialized };
}
