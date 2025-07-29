"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mic, Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Meal } from "@/lib/types";
import { analyzeMealAction } from "@/app/actions";

interface MealLoggerProps {
  onMealAdded: (meal: Meal) => void;
}

const MealLoggerSchema = z.object({
  description: z.string().min(3, "Please describe your meal in a bit more detail."),
});

type MealLoggerValues = z.infer<typeof MealLoggerSchema>;

export function MealLogger({ onMealAdded }: MealLoggerProps) {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const onSubmit = async (data: MealLoggerValues) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeMealAction({ mealDescription: data.description });
      const newMeal: Meal = {
        ...analysis,
        id: new Date().toISOString() + Math.random(),
        date: new Date().toISOString(),
        description: data.description,
      };
      onMealAdded(newMeal);
      form.reset();
      toast({
        title: "Meal Logged!",
        description: "Your meal has been analyzed and added to your daily log.",
      });
    } catch (error) {
      console.error("Failed to analyze meal", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "The AI could not analyze your meal. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-headline">Log a Meal</CardTitle>
        <CardDescription>Describe what you ate, or use your voice.</CardDescription>
      </CardHeader>
      <CardContent>
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
                disabled={isAnalyzing}
              >
                <Mic className="h-4 w-4" />
                <span className="sr-only">Use Voice</span>
              </Button>
              <Button type="submit" className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Analyze & Log Meal
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
