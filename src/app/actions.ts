"use server";

import {
  analyzeMeal,
  type AnalyzeMealInput,
  type AnalyzeMealOutput,
} from "@/ai/flows/analyze-meal";
import {
  nutritionChat,
  type NutritionChatInput,
  type NutritionChatOutput,
} from "@/ai/flows/nutrition-chat";
import {
  calculateGoals,
  type CalculateGoalsInput,
  type CalculateGoalsOutput,
} from "@/ai/flows/calculate-goals";

export async function analyzeMealAction(
  input: AnalyzeMealInput
): Promise<AnalyzeMealOutput> {
  return analyzeMeal(input);
}

export async function nutritionChatAction(
  input: NutritionChatInput
): Promise<NutritionChatOutput> {
  return nutritionChat(input);
}

export async function calculateGoalsAction(
  input: CalculateGoalsInput
): Promise<CalculateGoalsOutput> {
  return calculateGoals(input);
}
