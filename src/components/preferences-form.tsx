
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
import { useUserStore } from "@/hooks/use-user-store";
import { DialogFooter } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

interface PreferencesFormProps {
  currentPreferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}

const preferencesSchema = z.object({
  dietaryRestrictions: z.array(z.string()),
  healthGoals: z.array(z.string()),
  likes: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  dislikes: z.string().transform(val => val.split(',').map(s => s.trim()).filter(Boolean)),
  sex: z.enum(["male", "female", "other"]).optional(),
  age: z.coerce.number().optional(),
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
});

const defaultDietaryOptions = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Allergy"];
const defaultGoalOptions = ["Lose Weight", "Gain Muscle", "Maintain Weight", "Improve Endurance", "Eat Healthier"];

export function PreferencesForm({ currentPreferences, onSave }: PreferencesFormProps) {
  const { savePreferences } = useUserStore();
  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      dietaryRestrictions: currentPreferences.dietaryRestrictions || [],
      healthGoals: currentPreferences.healthGoals || [],
      likes: (currentPreferences.likes || []).join(', '),
      dislikes: (currentPreferences.dislikes || []).join(', '),
      sex: currentPreferences.sex,
      age: currentPreferences.age || undefined,
      height: currentPreferences.height || undefined,
      weight: currentPreferences.weight || undefined,
      activityLevel: currentPreferences.activityLevel || 'sedentary',
    },
  });

  useEffect(() => {
    form.reset({
        dietaryRestrictions: currentPreferences.dietaryRestrictions || [],
        healthGoals: currentPreferences.healthGoals || [],
        likes: (currentPreferences.likes || []).join(', '),
        dislikes: (currentPreferences.dislikes || []).join(', '),
        sex: currentPreferences.sex,
        age: currentPreferences.age || undefined,
        height: currentPreferences.height || undefined,
        weight: currentPreferences.weight || undefined,
        activityLevel: currentPreferences.activityLevel || 'sedentary',
    });
  }, [currentPreferences, form.reset]);

  const onSubmit = (data: z.infer<typeof preferencesSchema>) => {
    const newPreferences: UserPreferences = {
        ...currentPreferences,
        ...data,
        likes: Array.isArray(data.likes) ? data.likes : data.likes.split(',').map(s => s.trim()).filter(Boolean),
        dislikes: Array.isArray(data.dislikes) ? data.dislikes : data.dislikes.split(',').map(s => s.trim()).filter(Boolean),
    };
    savePreferences(newPreferences);
    onSave(newPreferences);
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
            <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="stats">Your Stats</TabsTrigger>
                    <TabsTrigger value="goals">Goals & Diet</TabsTrigger>
                    <TabsTrigger value="prefs">Preferences</TabsTrigger>
                </TabsList>
                <ScrollArea className="pr-4 mt-4 max-h-[50vh] overflow-y-auto">
                    <TabsContent value="stats" className="space-y-6">
                        <div>
                            <Label className="font-semibold">Your Stats</Label>
                            <p className="text-sm text-muted-foreground mb-4">Provide your stats for personalized goal setting.</p>
                            <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                    <Label>Age</Label>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 25" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sex"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <Label>Sex</Label>
                                        <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-4 pt-1"
                                        >
                                            <FormItem className="flex items-center space-x-2">
                                                <FormControl>
                                                    <RadioGroupItem value="male" id="male" />
                                                </FormControl>
                                                <Label htmlFor="male" className="font-normal">Male</Label>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                    <RadioGroupItem value="female" id="female" />
                                                </FormControl>
                                                <Label htmlFor="female" className="font-normal">Female</Label>
                                            </FormItem>
                                        </RadioGroup>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                    <Label>Height (cm)</Label>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 175" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                    <Label>Weight (kg)</Label>
                                    <FormControl>
                                        <Input type="number" placeholder="e.g. 70" {...field} value={field.value ?? ''} />
                                    </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="activityLevel"
                                render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <Label>Activity Level</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select your activity level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
                                        <SelectItem value="light">Lightly Active (light exercise/sports 1-3 days/week)</SelectItem>
                                        <SelectItem value="moderate">Moderately Active (moderate exercise/sports 3-5 days/week)</SelectItem>
                                        <SelectItem value="active">Very Active (hard exercise/sports 6-7 days a week)</SelectItem>
                                        <SelectItem value="very_active">Extra Active (very hard exercise/physical job)</SelectItem>
                                    </SelectContent>
                                    </Select>
                                </FormItem>
                                )}
                            />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="goals" className="space-y-6">
                        <div>
                            <Label className="font-semibold">Health Goals</Label>
                            <p className="text-sm text-muted-foreground mb-4">What are you trying to achieve?</p>
                            <div className="grid grid-cols-2 gap-2">
                            {defaultGoalOptions.map((option) => (
                                <FormField
                                key={option}
                                control={form.control}
                                name="healthGoals"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(option)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), option])
                                                    : field.onChange(
                                                        (field.value || [])?.filter(
                                                        (value) => value !== option
                                                        )
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <Label className="font-normal">{option}</Label>
                                    </FormItem>
                                )}
                                />
                            ))}
                            </div>
                        </div>
                        <div>
                            <Label className="font-semibold">Dietary Restrictions</Label>
                            <p className="text-sm text-muted-foreground mb-4">Select any dietary needs you have.</p>
                            <div className="grid grid-cols-2 gap-2">
                            {defaultDietaryOptions.map((option) => (
                                <FormField
                                key={option}
                                control={form.control}
                                name="dietaryRestrictions"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(option)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), option])
                                                    : field.onChange(
                                                        (field.value || [])?.filter(
                                                        (value) => value !== option
                                                        )
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <Label className="font-normal">{option}</Label>
                                    </FormItem>
                                )}
                                />
                            ))}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="prefs" className="space-y-6">
                        <FormField
                            control={form.control}
                            name="likes"
                            render={({ field }) => (
                                <FormItem>
                                <Label className="font-semibold">Likes</Label>
                                <p className="text-sm text-muted-foreground">List foods you enjoy, separated by commas.</p>
                                <FormControl>
                                    <Input placeholder="e.g., chicken, broccoli, apples" {...field} />
                                </FormControl>
                                </FormItem>
                            )}
                            />

                        <FormField
                            control={form.control}
                            name="dislikes"
                            render={({ field }) => (
                                <FormItem>
                                <Label className="font-semibold">Dislikes</Label>
                                <p className="text-sm text-muted-foreground">List foods you want to avoid, separated by commas.</p>
                                <FormControl>
                                    <Input placeholder="e.g., cucumbers, olives" {...field} />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </ScrollArea>
            </Tabs>

            <DialogFooter className="pt-4">
                <Button type="submit">Save Preferences</Button>
            </DialogFooter>
        </form>
    </Form>
  );
}
