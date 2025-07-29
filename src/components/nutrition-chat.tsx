
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot, Sparkles, Settings } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMealStore } from "@/hooks/use-meal-store";
import { useUserStore } from "@/hooks/use-user-store";
import type { ChatMessage, Meal, UserPreferences } from "@/lib/types";
import { nutritionChatAction } from "@/app/actions";
import { cn } from "@/lib/utils";
import { PreferencesForm } from "./preferences-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

function formatMealHistory(meals: Meal[]): string {
    if (meals.length === 0) {
      return "No meals logged in the last 7 days.";
    }
  
    const summary = meals
      .map((meal) => `- On ${new Date(meal.date).toLocaleDateString()}, user ate: ${meal.description}. (Calories: ${meal.calories.toFixed(0)}, Protein: ${meal.protein.toFixed(0)}g, Carbs: ${meal.carbs.toFixed(0)}g, Fats: ${meal.fats.toFixed(0)}g)`)
      .join("\n");
  
    return `Here is a summary of the user's logged meals from the past 7 days:\n${summary}`;
  }  

export function NutritionChat() {
  const { meals, isInitialized: isMealsInitialized } = useMealStore();
  const { preferences, setPreferences, isInitialized: isUserInitialized } = useUserStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isInitialMessageFetched = useRef(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const isInitialized = isMealsInitialized && isUserInitialized;

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollDiv = scrollAreaRef.current.querySelector("div");
        if (scrollDiv) {
            scrollDiv.scrollTo({ top: scrollDiv.scrollHeight, behavior: 'smooth' });
        }
    }
  }, [messages]);

  const handlePreferencesSave = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    setIsPreferencesOpen(false);
    
    // Kick off a new conversation with the updated preferences
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "assistant",
      message: "Thanks for setting your preferences! How can I help you plan your meals or improve your diet?",
    };
    setMessages([welcomeMessage]);
  };

  useEffect(() => {
    if (isInitialized && !isInitialMessageFetched.current) {
      const getInitialInsights = async () => {
        setIsLoading(true);
        isInitialMessageFetched.current = true;
        
        const hasPreferences = preferences.dietaryRestrictions?.length || preferences.healthGoals?.length;

        if (!hasPreferences) {
          const welcomeMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            message: "Welcome to your AI Nutrition Coach! To give you the best advice, I need to know a little more about you. Please set your dietary preferences and goals.",
          };
          setMessages([welcomeMessage]);
          setIsLoading(false);
          return;
        }

        try {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const recentMeals = meals.filter(meal => new Date(meal.date) > sevenDaysAgo);
          const mealHistory = formatMealHistory(recentMeals);
          
          let initialPrompt = "Hello! Based on my recent meals and my preferences, can you give me some quick insights and suggest what I could eat next to meet my goals?";
          if (recentMeals.length === 0) {
            initialPrompt = "Hello! I haven't logged any meals yet. Based on my preferences, could you give me some suggestions for a healthy breakfast to start my day?";
          }
          
          const response = await nutritionChatAction({ message: initialPrompt, mealHistory, preferences });
          
          const assistantMessage: ChatMessage = {
              id: Date.now().toString(),
              role: "assistant",
              message: response.response,
          };
          setMessages([assistantMessage]);
        } catch (error) {
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "assistant",
            message: "Sorry, I'm having trouble connecting. Please try again later.",
          };
          setMessages([errorMessage]);
        } finally {
          setIsLoading(false);
        }
      };
      
      getInitialInsights();
    }
  }, [isInitialized, meals, preferences]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      message: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentMeals = meals.filter(meal => new Date(meal.date) > sevenDaysAgo);
        const mealHistory = formatMealHistory(recentMeals);
        
        const response = await nutritionChatAction({ message: input, mealHistory, preferences });
        
        const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            message: response.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        if (response.updatedPreferences) {
          const newPrefs = { ...preferences };
          newPrefs.likes = [...new Set([...(newPrefs.likes || []), ...(response.updatedPreferences.likes || [])])];
          newPrefs.dislikes = [...new Set([...(newPrefs.dislikes || []), ...(response.updatedPreferences.dislikes || [])])];
          setPreferences(newPrefs);
        }

    } catch (error) {
        const errorMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            message: "Sorry, I'm having trouble connecting. Please try again later.",
        };
        setMessages((prev) => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  const hasPreferences = preferences.dietaryRestrictions?.length || preferences.healthGoals?.length;

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4">
          {messages.length === 0 && !isLoading && !hasPreferences && (
              <div className="text-center text-sm text-muted-foreground p-8 flex flex-col items-center gap-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <p>Welcome! Let's set your nutrition goals to get started.</p>
                <Button onClick={() => setIsPreferencesOpen(true)}>Set Preferences</Button>
              </div>
          )}
          {messages.length === 0 && !isLoading && hasPreferences && (
              <div className="text-center text-sm text-muted-foreground p-8 flex flex-col items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <p>Your AI Nutrition Coach is ready.</p>
                <p>Ask anything about your diet or get meal suggestions!</p>
              </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs rounded-lg p-3 text-sm md:max-w-md",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border"
                )}
              >
                <p className="whitespace-pre-wrap">{msg.message}</p>
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
              </Avatar>
              <div className="max-w-xs rounded-lg p-3 text-sm md:max-w-md bg-card border">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1"
            disabled={isLoading || !isInitialized}
          />
           <Dialog open={isPreferencesOpen} onOpenChange={setIsPreferencesOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" disabled={isLoading}>
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Preferences</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Your Preferences</DialogTitle>
                </DialogHeader>
                <PreferencesForm currentPreferences={preferences} onSave={handlePreferencesSave} />
            </DialogContent>
           </Dialog>

          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !isInitialized}>
            {isLoading && messages.length > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
