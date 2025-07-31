
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mic, Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Meal } from "@/lib/types";
import { analyzeMealAction } from "@/app/actions";
import { CardDescription } from "@/components/ui/card";
import { useMealStore } from "@/hooks/use-meal-store";

interface MealLoggerProps {
  onMealAdded: (meal: Meal) => void;
}

const MealLoggerSchema = z.object({
  description: z.string().min(3, "Please describe your meal in a bit more detail."),
});

type MealLoggerValues = z.infer<typeof MealLoggerSchema>;

export function MealLogger({ onMealAdded }: MealLoggerProps) {
  const { toast } = useToast();
  const { addMeal, updateMeal } = useMealStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm<MealLoggerValues>({
    resolver: zodResolver(MealLoggerSchema),
    defaultValues: { description: "" },
  });

  useEffect(() => {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (window.SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        form.setValue("description", transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        toast({
          variant: "destructive",
          title: "Voice Error",
          description: "Couldn't recognize your speech. Please try again or type manually.",
        });
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => {
        if(isRecording) setIsRecording(false);
      };
    }
  }, [form, toast, isRecording]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
        toast({
          variant: "destructive",
          title: "Browser Not Supported",
          description: "Your browser doesn't support voice recognition.",
        });
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Could not start recognition", error);
        toast({
          variant: "destructive",
          title: "Voice Error",
          description: "Could not start voice recognition. Please check your microphone permissions.",
        });
      }
    }
  };

  const onSubmit = async (data: MealLoggerValues) => {
    setIsSubmitting(true);
    
    const tempId = new Date().toISOString() + Math.random();
    const optimisticMeal: Meal = {
      id: tempId,
      date: new Date().toISOString(),
      description: data.description,
      status: 'pending',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      ingredients: [],
    };

    addMeal(optimisticMeal);
    onMealAdded(optimisticMeal);
    form.reset();
    
    try {
      const analysis = await analyzeMealAction({ mealDescription: data.description });
      const finalMeal: Partial<Meal> & { status: 'complete' } = {
        ...analysis,
        status: 'complete',
      };
      updateMeal(tempId, finalMeal);
      
      toast({
        title: "Meal Logged!",
        description: "Your meal has been analyzed and added to your daily log.",
      });
    } catch (error) {
      console.error("Failed to analyze meal", error);
      updateMeal(tempId, { status: 'failed' }); // Use a 'failed' status
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "The AI could not analyze your meal. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-2 space-y-4">
      <CardDescription>Describe what you ate, or use your voice.</CardDescription>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'A bowl of oatmeal with blueberries and a glass of orange juice'"
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                onClick={handleVoiceInput}
                disabled={isSubmitting}
              >
                <Mic className="h-4 w-4" />
                <span className="sr-only">Use Voice</span>
              </Button>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Analyze & Log Meal
              </Button>
            </div>
          </form>
        </Form>
    </div>
  );
}
