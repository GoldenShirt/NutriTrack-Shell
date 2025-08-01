
"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserPreferences } from "@/lib/types";

const STORE_KEY = "nutritrack-user";

const initialPreferences: UserPreferences = {
  dietaryRestrictions: [],
  healthGoals: [],
  likes: [],
  dislikes: [],
  sex: undefined,
  age: undefined,
  height: undefined,
  weight: undefined,
  activityLevel: 'sedentary',
  geminiApiKey: undefined,
  whisperApiKey: undefined,
};

export function useUserStore() {
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(STORE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setPreferences(userData.preferences || initialPreferences);
      }
    } catch (error) {
      console.error("Failed to load user data from localStorage", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    const updatedPrefs = {...newPreferences};
    setPreferences(updatedPrefs);
    try {
        if (typeof window !== "undefined") {
            const userData = { preferences: updatedPrefs };
            localStorage.setItem(STORE_KEY, JSON.stringify(userData));
        }
      } catch (error) {
        console.error("Failed to save user data to localStorage", error);
      }
  }, []);
  
  const clearPreferences = useCallback(() => {
    setPreferences(initialPreferences);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORE_KEY);
      }
    } catch (error) {
      console.error("Failed to clear user data from localStorage", error);
    }
  }, []);

  return { preferences, setPreferences: savePreferences, savePreferences, clearPreferences, isInitialized };
}

    