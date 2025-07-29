"use client";

import { useState } from "react";
import { Bot, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Icons } from "@/components/icons";
import { Dashboard } from "@/components/dashboard";
import { NutritionChat } from "@/components/nutrition-chat";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
        <div className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold">NutriTrack</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Dashboard />
      </main>
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
            size="icon"
          >
            <MessageCircle className="h-8 w-8" />
            <span className="sr-only">Open Nutrition Chat</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl">AI Nutrition Coach</span>
              </div>
            </SheetTitle>
          </SheetHeader>
          <NutritionChat />
        </SheetContent>
      </Sheet>
    </div>
  );
}
