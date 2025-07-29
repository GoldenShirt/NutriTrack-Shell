// This file defines an AI-powered flow to calculate personalized daily nutrition goals.
//
// It takes user's personal statistics (age, sex, height, weight, activity level)
// and health goals as input, and returns recommended daily intake for calories,
// protein, carbs, and fats.
//
// Exported functions:
// - calculateGoals: Calculates personalized daily nutrition goals.
//
// Types:
// - CalculateGoalsInput: The input type for the calculateGoals function.
// - CalculateGoalsOutput: The output type for the calculateGoals function.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { CalculateGoalsOutputSchema } from '@/lib/types';


const CalculateGoalsInputSchema = z.object({
  age: z.number().describe('The age of the user in years.'),
  sex: z.enum(['male', 'female', 'other']).describe('The biological sex of the user.'),
  height: z.number().describe('The height of the user in centimeters.'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  activityLevel: z
    .enum(['sedentary', 'light', 'moderate', 'active', 'very_active'])
    .describe('The activity level of the user.'),
  healthGoals: z.array(z.string()).optional().describe("The user's health goals (e.g., 'Lose Weight', 'Gain Muscle')."),
});
export type CalculateGoalsInput = z.infer<typeof CalculateGoalsInputSchema>;
export type CalculateGoalsOutput = z.infer<typeof CalculateGoalsOutputSchema>;


export async function calculateGoals(input: CalculateGoalsInput): Promise<CalculateGoalsOutput> {
  return calculateGoalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateGoalsPrompt',
  input: {schema: CalculateGoalsInputSchema},
  output: {schema: CalculateGoalsOutputSchema},
  prompt: `You are an expert nutritionist. Your task is to calculate personalized daily nutritional goals based on user-provided data.

  User Data:
  - Age: {{{age}}} years
  - Sex: {{{sex}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg
  - Activity Level: {{{activityLevel}}}
  - Health Goals: {{#if healthGoals}}{{#each healthGoals}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified.{{/if}}

  Instructions:
  1.  Calculate Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation:
      - For males: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) + 5
      - For females: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (y) - 161
      - If sex is 'other', use the average of the male and female formulas.
  2.  Calculate Total Daily Energy Expenditure (TDEE) by multiplying BMR by the appropriate activity factor:
      - sedentary: 1.2
      - light: 1.375
      - moderate: 1.55
      - active: 1.725
      - very_active: 1.9
  3.  Adjust the TDEE based on the user's health goals to get the final daily calorie goal:
      - If 'Lose Weight' is a goal, subtract 500 calories.
      - If 'Gain Muscle' is a goal (and not 'Lose Weight'), add 500 calories.
      - If neither 'Lose Weight' nor 'Gain Muscle' are goals, use TDEE as the calorie goal.
  4.  Determine the macronutrient split based on the health goals and the final calorie goal:
      - If 'Lose Weight' is a goal: 35% carbs, 40% protein, 25% fats.
      - If 'Gain Muscle' is a goal: 45% carbs, 35% protein, 20% fats.
      - If neither (i.e., 'Maintain Weight' or other goals): 40% carbs, 30% protein, 30% fats.
  5.  Calculate the grams for each macronutrient:
      - Protein: 4 calories per gram.
      - Carbs: 4 calories per gram.
      - Fats: 9 calories per gram.

  Return the final calculated goals as a JSON object, with all values as numbers, rounded to the nearest whole number.`,
});

const calculateGoalsFlow = ai.defineFlow(
  {
    name: 'calculateGoalsFlow',
    inputSchema: CalculateGoalsInputSchema,
    outputSchema: CalculateGoalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
