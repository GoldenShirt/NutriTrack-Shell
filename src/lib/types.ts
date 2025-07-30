import type { AnalyzeMealOutput } from "@/ai/flows/analyze-meal";
import { z } from "zod";

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
  sex?: "male" | "female" | "other";
  age?: number;
  height?: number;
  weight?: number;
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
}

export const CalculateGoalsOutputSchema = z.object({
  calories: z.number().describe('The recommended daily calorie intake.'),
  protein: z.number().describe('The recommended daily protein intake in grams.'),
  carbs: z.number().describe('The recommended daily carbohydrate intake in grams.'),
  fats: z.number().describe('The recommended daily fat intake in grams.'),
  vitaminC: z.number().optional().describe('The recommended daily Vitamin C intake in milligrams (mg).'),
  vitaminD: z.number().optional().describe('The recommended daily Vitamin D intake in micrograms (mcg).'),
  iron: z.number().optional().describe('The recommended daily Iron intake in milligrams (mg).'),
  calcium: z.number().optional().describe('The recommended daily Calcium intake in milligrams (mg).'),
  potassium: z.number().optional().describe('The recommended daily Potassium intake in milligrams (mg).'),
});
export type DailyGoals = z.infer<typeof CalculateGoalsOutputSchema>;
