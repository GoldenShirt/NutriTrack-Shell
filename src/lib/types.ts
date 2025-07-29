import type { AnalyzeMealOutput } from "@/ai/flows/analyze-meal";

export interface Meal extends AnalyzeMealOutput {
  id: string;
  date: string; // ISO string
  description: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  message: string;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  healthGoals: string[];
  likes: string[];
  dislikes: string[];
}
