"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, User, Bot } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMealStore } from "@/hooks/use-meal-store";
import type { ChatMessage, Meal } from "@/lib/types";
import { nutritionChatAction } from "@/app/actions";
import { cn } from "@/lib/utils";

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
  const { meals } = useMealStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

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
        
        const response = await nutritionChatAction({ message: input, mealHistory });
        
        const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            message: response.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);

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

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground p-8">
                Ask me anything about your diet, suggest healthy meals, or get nutrition advice!
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
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
