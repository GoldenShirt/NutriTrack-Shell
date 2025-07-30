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

import { z } from 'genkit';
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
    const { age, sex, height, weight, activityLevel, healthGoals = [] } = input;

    // 1. Calculate BMR (Mifflin-St Jeor Equation)
    let bmr: number;
    const baseBmrCalc = 10 * weight + 6.25 * height - 5 * age;
    if (sex === 'male') {
        bmr = baseBmrCalc + 5;
    } else if (sex === 'female') {
        bmr = baseBmrCalc - 161;
    } else { // 'other'
        // Average the male and female BMRs for 'other'
        const bmrMale = baseBmrCalc + 5;
        const bmrFemale = baseBmrCalc - 161;
        bmr = (bmrMale + bmrFemale) / 2;
    }

    // 2. Calculate TDEE (Total Daily Energy Expenditure)
    const activityFactors = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
    };
    const tdee = bmr * activityFactors[activityLevel];

    // 3. Adjust TDEE for calorie goal based on a priority of goals
    let calorieGoal = tdee;
    
    // 4. Determine macronutrient split and adjust calories based on goal combinations
    // The order of these checks is important to handle combined goals correctly.
    let macroSplit = { carbs: 0.45, protein: 0.25, fats: 0.30 }; // Default/Maintain/Eat Healthier

    const hasLoseWeight = healthGoals.includes('Lose Weight');
    const hasGainMuscle = healthGoals.includes('Gain Muscle');
    const hasImproveEndurance = healthGoals.includes('Improve Endurance');

    if (hasLoseWeight && hasGainMuscle) { // Body Recomposition
        calorieGoal = tdee - 250; // Slight deficit
        macroSplit = { carbs: 0.35, protein: 0.40, fats: 0.25 }; // High protein
    } else if (hasGainMuscle && hasImproveEndurance) { // Athletic build
        calorieGoal = tdee + 250; // Slight surplus
        macroSplit = { carbs: 0.50, protein: 0.30, fats: 0.20 }; // Higher carbs for dual goals
    } else if (hasLoseWeight) { // Prioritize Weight Loss
        calorieGoal = tdee - 500; // Standard deficit
        macroSplit = { carbs: 0.35, protein: 0.40, fats: 0.25 }; // High protein to preserve muscle
    } else if (hasGainMuscle) { // Prioritize Muscle Gain
        calorieGoal = tdee + 300; // More conservative surplus for lean gain
        macroSplit = { carbs: 0.45, protein: 0.35, fats: 0.20 }; // High protein and moderate carbs
    } else if (hasImproveEndurance) { // Prioritize Endurance
        calorieGoal = tdee; // Often done at maintenance
        macroSplit = { carbs: 0.55, protein: 0.25, fats: 0.20 }; // High carbs for fuel
    } else if (healthGoals.includes('Maintain Weight')) {
        calorieGoal = tdee; // Explicitly maintain
        macroSplit = { carbs: 0.45, protein: 0.25, fats: 0.30 };
    }

    // 5. Calculate grams for each macronutrient
    const proteinGrams = (calorieGoal * macroSplit.protein) / 4;
    const carbsGrams = (calorieGoal * macroSplit.carbs) / 4;
    const fatsGrams = (calorieGoal * macroSplit.fats) / 9;

    // 6. Calculate micronutrient goals
    const effectiveSexForMicros = (sex === 'other' || sex === 'male') ? 'male' : 'female';

    const calcium = age > 50 && effectiveSexForMicros === 'female' ? 1200 : (age > 70 && effectiveSexForMicros === 'male' ? 1200 : 1000);
    const iron = effectiveSexForMicros === 'female' && age >= 19 && age <= 50 ? 18 : 8;
    const potassium = effectiveSexForMicros === 'male' ? 3400 : 2600;
    const vitaminC = effectiveSexForMicros === 'male' ? 90 : 75;
    const vitaminD = age > 70 ? 20 : 15;

    const result: CalculateGoalsOutput = {
        calories: Math.round(calorieGoal),
        protein: Math.round(proteinGrams),
        carbs: Math.round(carbsGrams),
        fats: Math.round(fatsGrams),
        calcium: Math.round(calcium),
        iron: Math.round(iron),
        potassium: Math.round(potassium),
        vitaminC: Math.round(vitaminC),
        vitaminD: Math.round(vitaminD),
    };
    
    // Ensure the function returns a promise
    return Promise.resolve(result);
}
