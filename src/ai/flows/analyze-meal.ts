// This is an AI-powered meal analysis tool.
//
// It allows users to log meals using voice or text input, and the AI analyzes the meal
// and provides nutrition insights such as calories, protein, carbs, and fats.
//
// Exported functions:
// - analyzeMeal: Analyzes the meal and returns nutrition insights.
//
// Types:
// - AnalyzeMealInput: The input type for the analyzeMeal function.
// - AnalyzeMealOutput: The output type for the analyzeMeal function.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMealInputSchema = z.object({
  mealDescription: z
    .string()
    .describe('The description of the meal, provided by the user.'),
});
export type AnalyzeMealInput = z.infer<typeof AnalyzeMealInputSchema>;

const AnalyzeMealOutputSchema = z.object({
  calories: z.number().describe('The estimated calorie count of the meal.'),
  protein: z.number().describe('The estimated protein content of the meal, in grams.'),
  carbs: z.number().describe('The estimated carbohydrate content of the meal, in grams.'),
  fats: z.number().describe('The estimated fat content of the meal, in grams.'),
  ingredients: z.array(z.string()).describe('A list of identified ingredients in the meal.'),
});
export type AnalyzeMealOutput = z.infer<typeof AnalyzeMealOutputSchema>;

export async function analyzeMeal(input: AnalyzeMealInput): Promise<AnalyzeMealOutput> {
  return analyzeMealFlow(input);
}

const analyzeMealPrompt = ai.definePrompt({
  name: 'analyzeMealPrompt',
  input: {schema: AnalyzeMealInputSchema},
  output: {schema: AnalyzeMealOutputSchema},
  prompt: `Analyze the following meal description and provide an estimate of its nutritional content.

Meal Description: {{{mealDescription}}}

Consider the ingredients and preparation methods to estimate the calories, protein, carbs, and fats.
Also, list the ingredients that you recognize.

Format your response as a JSON object with the following fields:
- calories: The estimated calorie count of the meal.
- protein: The estimated protein content of the meal, in grams.
- carbs: The estimated carbohydrate content of the meal, in grams.
- fats: The estimated fat content of the meal, in grams.
- ingredients: A list of identified ingredients in the meal.`,
});

const analyzeMealFlow = ai.defineFlow(
  {
    name: 'analyzeMealFlow',
    inputSchema: AnalyzeMealInputSchema,
    outputSchema: AnalyzeMealOutputSchema,
  },
  async input => {
    const {output} = await analyzeMealPrompt(input);
    return output!;
  }
);
