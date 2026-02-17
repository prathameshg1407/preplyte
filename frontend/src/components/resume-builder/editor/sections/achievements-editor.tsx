'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, AchievementItem } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Save, Plus, Trash2, Trophy } from 'lucide-react';

const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Achievement title is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
  issuer: z.string().max(100).optional().or(z.literal('')),
});

const achievementsFormSchema = z.object({
  achievements: z.array(achievementItemSchema).max(20),
});

type AchievementsFormData = z.infer<typeof achievementsFormSchema>;

interface AchievementsEditorProps {
  resume: Resume;
  onSave: (data: AchievementItem[]) => Promise<void>;
}

export function AchievementsEditor({ resume, onSave }: AchievementsEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const defaultAchievements: AchievementItem[] = resume.content.achievements || [];

  const form = useForm<AchievementsFormData>({
    resolver: zodResolver(achievementsFormSchema),
    defaultValues: {
      achievements: defaultAchievements,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'achievements',
  });

  const addAchievement = () => {
    append({
      id: uuidv4(),
      title: '',
      description: '',
      date: '',
      issuer: '',
    });
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const onSubmit = async (data: AchievementsFormData) => {
    const cleanedData = data.achievements.map((achievement) => ({
      ...achievement,
      description: achievement.description || undefined,
      date: achievement.date || undefined,
      issuer: achievement.issuer || undefined,
    }));

    updateContent({ achievements: cleanedData });
    await onSave(cleanedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievements & Awards</h2>
          <p className="text-muted-foreground">
            Highlight your notable achievements and awards
          </p>
        </div>
        <Button onClick={addAchievement} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Achievement
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No achievements added</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Add your achievements, awards, and recognitions to stand out
                </p>
                <Button onClick={addAchievement} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Achievement
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">
                          {form.watch(`achievements.${index}.title`) || `Achievement ${index + 1}`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteIndex(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`achievements.${index}.title`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Achievement Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Employee of the Year" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`achievements.${index}.issuer`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issuer / Organization</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Company Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`achievements.${index}.date`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="month" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`achievements.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of the achievement..."
                                className="min-h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {fields.length > 0 && (
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>

      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Achievement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this achievement?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}