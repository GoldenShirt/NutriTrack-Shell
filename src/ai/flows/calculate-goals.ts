// This file defines an AI-powered flow to calculate personalized daily nutrition goals.
//
// It takes user's personal statistics (age, sex, height, weight, activity level)
// and health goals as input, and returns recommended daily intake for calories,
// protein, carbs, fats, and key micronutrients.
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

  MACRONUTRIENT INSTRUCTIONS:
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
  3.  Adjust TDEE for calorie goal:
      - If healthGoals includes 'Lose Weight', subtract 500 calories.
      - If healthGoals includes 'Gain Muscle' (and not 'Lose Weight'), add 500 calories.
      - Otherwise, use TDEE.
  4.  Determine macronutrient split based on goals:
      - 'Lose Weight': 35% carbs, 40% protein, 25% fats.
      - 'Gain Muscle': 45% carbs, 35% protein, 20% fats.
      - Default ('Maintain Weight' etc.): 40% carbs, 30% protein, 30% fats.
  5.  Calculate grams for each macronutrient (Protein/Carbs: 4 cal/g, Fats: 9 cal/g).

  MICRONUTRIENT INSTRUCTIONS:
  1.  Calculate daily micronutrient goals based on the user's age and sex. Use the following general Recommended Dietary Allowances (RDAs).
      - Calcium (mg): 1000 for adults 19-50. 1200 for women 51+ and men 71+.
      - Iron (mg): 8 for adult men and women 51+. 18 for women 19-50.
      - Potassium (mg): 3400 for adult men. 2600 for adult women.
      - Vitamin C (mg): 90 for adult men. 75 for adult women.
      - Vitamin D (mcg): 15 for adults up to age 70. 20 for adults over 70.
  2.  If sex is 'other', use the male recommendations.

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
