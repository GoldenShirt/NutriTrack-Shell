'use server';
/**
 * @fileOverview An AI-powered nutrition assistant that answers questions, suggests meals,
 * and provides personalized advice based on logged meals and dietary goals.
 *
 * - nutritionChat - A function that handles the nutrition chat process.
 * - NutritionChatInput - The input type for the nutritionChat function.
 * - NutritionChatOutput - The return type for the nutritionChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionChatInputSchema = z.object({
  message: z.string().describe('The user message to the nutrition assistant.'),
  mealHistory: z.string().optional().describe('A summary of the user\'s meal history.'),
});
export type NutritionChatInput = z.infer<typeof NutritionChatInputSchema>;

const NutritionChatOutputSchema = z.object({
  response: z.string().describe('The response from the nutrition assistant.'),
});
export type NutritionChatOutput = z.infer<typeof NutritionChatOutputSchema>;

export async function nutritionChat(input: NutritionChatInput): Promise<NutritionChatOutput> {
  return nutritionChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionChatPrompt',
  input: {schema: NutritionChatInputSchema},
  output: {schema: NutritionChatOutputSchema},
  prompt: `You are a helpful AI nutrition assistant. Your goal is to answer user questions about their diet, suggest healthy meal options, and provide personalized nutrition advice.

  Use the user's meal history to provide personalized advice. If meal history is not available answer the user's question to the best of your ability.

  User's Meal History:
  {{#if mealHistory}}
  {{{mealHistory}}}
  {{else}}
  No meal history available.
  {{/if}}

  User Message: {{{message}}}
  `,
});

const nutritionChatFlow = ai.defineFlow(
  {
    name: 'nutritionChatFlow',
    inputSchema: NutritionChatInputSchema,
    outputSchema: NutritionChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
