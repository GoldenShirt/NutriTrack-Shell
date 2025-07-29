"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserPreferences } from "@/lib/types";

const STORE_KEY = "nutritrack-user";

const initialPreferences: UserPreferences = {
  dietaryRestrictions: [],
  healthGoals: [],
  likes: [],
  dislikes: [],
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

  useEffect(() => {
    if (isInitialized) {
      try {
        const userData = { preferences };
        localStorage.setItem(STORE_KEY, JSON.stringify(userData));
      } catch (error) {
        console.error("Failed to save user data to localStorage", error);
      }
    }
  }, [preferences, isInitialized]);

  const updatePreferences = useCallback((newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
  }, []);

  return { preferences, setPreferences: updatePreferences, isInitialized };
}
