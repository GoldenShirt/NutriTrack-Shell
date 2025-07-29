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
  mealHistory: z.string().optional().describe("A summary of the user's meal history."),
  preferences: z
    .object({
      dietaryRestrictions: z.array(z.string()).optional(),
      healthGoals: z.array(z.string()).optional(),
      likes: z.array(z.string()).optional(),
      dislikes: z.array(z.string()).optional(),
    })
    .optional()
    .describe('User preferences and goals.'),
});
export type NutritionChatInput = z.infer<typeof NutritionChatInputSchema>;

const NutritionChatOutputSchema = z.object({
  response: z.string().describe('The response from the nutrition assistant.'),
  updatedPreferences: z.object({
    likes: z.array(z.string()).optional().describe("Updates to user's liked foods based on the conversation."),
    dislikes: z.array(z.string()).optional().describe("Updates to user's disliked foods based on the conversation."),
  }).optional().describe("A list of preferences learned from the conversation to be saved."),
});
export type NutritionChatOutput = z.infer<typeof NutritionChatOutputSchema>;

export async function nutritionChat(input: NutritionChatInput): Promise<NutritionChatOutput> {
  return nutritionChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionChatPrompt',
  input: {schema: NutritionChatInputSchema},
  output: {schema: NutritionChatOutputSchema},
  prompt: `You are a helpful and friendly AI nutrition assistant. Your goal is to answer user questions about their diet, suggest healthy meal options, and provide personalized nutrition advice.

  Use the user's meal history and preferences to provide personalized advice.

  If the user mentions new likes or dislikes, add them to the 'updatedPreferences' field in your response so they can be saved for next time. For example, if they say "I hate cucumbers", you should add "cucumbers" to the dislikes array.

  User's Meal History (last 7 days):
  {{#if mealHistory}}
    {{{mealHistory}}}
  {{else}}
    No meal history available.
  {{/if}}

  User's Preferences:
  - Dietary Restrictions: {{#if preferences.dietaryRestrictions}}{{#each preferences.dietaryRestrictions}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified.{{/if}}
  - Health Goals: {{#if preferences.healthGoals}}{{#each preferences.healthGoals}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified.{{/if}}
  - Likes: {{#if preferences.likes}}{{#each preferences.likes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified.{{/if}}
  - Dislikes: {{#if preferences.dislikes}}{{#each preferences.dislikes}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None specified.{{/if}}

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
