"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPreferences } from "@/lib/types";
import { useEffect } from "react";

interface PreferencesFormProps {
  currentPreferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}

const preferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()),
  healthGoals: z.array(z.string()),
  likes: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  dislikes: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
});

const defaultDietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Allergy"];
const defaultGoalOptions = ["Lose Weight", "Gain Muscle", "Maintain Weight", "Improve Endurance", "Eat Healthier"];

export function PreferencesForm({ currentPreferences, onSave }: PreferencesFormProps) {
  const {
    control,
    handleSubmit,
    watch,
    reset,
  } = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      dietaryRestrictions: currentPreferences.dietaryRestrictions || [],
      healthGoals: currentPreferences.healthGoals || [],
      likes: (currentPreferences.likes || []).join(', '),
      dislikes: (currentPreferences.dislikes || []).join(', '),
    },
  });

  useEffect(() => {
    reset({
        dietaryRestrictions: currentPreferences.dietaryRestrictions || [],
        healthGoals: currentPreferences.healthGoals || [],
        likes: (currentPreferences.likes || []).join(', '),
        dislikes: (currentPreferences.dislikes || []).join(', '),
    });
  }, [currentPreferences, reset]);

  const onSubmit = (data: z.infer<typeof preferencesSchema>) => {
    onSave({
        ...data,
        likes: Array.isArray(data.likes) ? data.likes : data.likes.split(',').map(s => s.trim()).filter(Boolean),
        dislikes: Array.isArray(data.dislikes) ? data.dislikes : data.dislikes.split(',').map(s => s.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
      <div>
        <Label className="font-semibold">Dietary Restrictions</Label>
        <p className="text-sm text-muted-foreground mb-2">Select any dietary needs you have.</p>
        <div className="grid grid-cols-2 gap-2">
          {defaultDietaryOptions.map((option) => (
            <Controller
              key={option}
              name="dietaryRestrictions"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`diet-${option}`}
                    checked={field.value?.includes(option)}
                    onCheckedChange={(checked) => {
                      return checked
                        ? field.onChange([...field.value, option])
                        : field.onChange(
                            field.value?.filter(
                              (value) => value !== option
                            )
                          );
                    }}
                  />
                  <Label htmlFor={`diet-${option}`} className="font-normal">{option}</Label>
                </div>
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="font-semibold">Health Goals</Label>
        <p className="text-sm text-muted-foreground mb-2">What are you trying to achieve?</p>
        <div className="grid grid-cols-2 gap-2">
          {defaultGoalOptions.map((option) => (
            <Controller
              key={option}
              name="healthGoals"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`goal-${option}`}
                    checked={field.value?.includes(option)}
                    onCheckedChange={(checked) => {
                      return checked
                        ? field.onChange([...field.value, option])
                        : field.onChange(
                            field.value?.filter(
                              (value) => value !== option
                            )
                          );
                    }}
                  />
                  <Label htmlFor={`goal-${option}`} className="font-normal">{option}</Label>
                </div>
              )}
            />
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="likes" className="font-semibold">Likes</Label>
        <p className="text-sm text-muted-foreground mb-2">List foods you enjoy, separated by commas.</p>
        <Controller
          name="likes"
          control={control}
          render={({ field }) => <Input id="likes" placeholder="e.g., chicken, broccoli, apples" {...field} />}
        />
      </div>

      <div>
        <Label htmlFor="dislikes" className="font-semibold">Dislikes</Label>
        <p className="text-sm text-muted-foreground mb-2">List foods you want to avoid, separated by commas.</p>
        <Controller
          name="dislikes"
          control={control}
          render={({ field }) => <Input id="dislikes" placeholder="e.g., cucumbers, olives" {...field} />}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Preferences</Button>
      </div>
    </form>
  );
}
