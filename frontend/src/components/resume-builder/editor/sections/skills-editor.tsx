'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, SkillCategory } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Loader2,
  Save,
  Plus,
  Trash2,
  Wrench,
  X,
} from 'lucide-react';

const skillCategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Category name is required').max(50),
  skills: z.array(z.string().max(50)).min(1, 'Add at least one skill').max(20),
});

const skillsFormSchema = z.object({
  categories: z.array(skillCategorySchema).max(10),
});

type SkillsFormData = z.infer<typeof skillsFormSchema>;

interface SkillsEditorProps {
  resume: Resume;
  onSave: (data: SkillCategory[]) => Promise<void>;
}

export function SkillsEditor({ resume, onSave }: SkillsEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [newSkill, setNewSkill] = useState<Record<string, string>>({});

  const defaultCategories: SkillCategory[] = resume.content.skills || [];

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: {
      categories: defaultCategories.length > 0 ? defaultCategories : [
        { id: uuidv4(), name: 'Technical Skills', skills: [] },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'categories',
  });

  const addCategory = () => {
    append({
      id: uuidv4(),
      name: '',
      skills: [],
    });
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const addSkillToCategory = (categoryIndex: number) => {
    const skill = newSkill[fields[categoryIndex].id]?.trim();
    if (!skill) return;

    const currentSkills = form.getValues(`categories.${categoryIndex}.skills`) || [];
    if (!currentSkills.includes(skill)) {
      form.setValue(`categories.${categoryIndex}.skills`, [...currentSkills, skill]);
    }
    setNewSkill((prev) => ({ ...prev, [fields[categoryIndex].id]: '' }));
  };

  const removeSkillFromCategory = (categoryIndex: number, skillIndex: number) => {
    const currentSkills = form.getValues(`categories.${categoryIndex}.skills`) || [];
    form.setValue(
      `categories.${categoryIndex}.skills`,
      currentSkills.filter((_, i) => i !== skillIndex)
    );
  };

  const onSubmit = async (data: SkillsFormData) => {
    const cleanedData = data.categories.filter(
      (cat) => cat.name && cat.skills.length > 0
    );
    updateContent({ skills: cleanedData });
    await onSave(cleanedData);
  };

  // Suggested skills based on common categories
  const suggestedSkills: Record<string, string[]> = {
    'Technical Skills': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'],
    'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go'],
    'Frameworks': ['React', 'Angular', 'Vue.js', 'Django', 'Spring Boot', 'Express.js'],
    'Soft Skills': ['Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Time Management'],
    'Tools': ['Git', 'Docker', 'AWS', 'Jira', 'Figma', 'VS Code'],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills</h2>
          <p className="text-muted-foreground">
            Organize your skills into categories
          </p>
        </div>
        <Button onClick={addCategory} variant="outline" disabled={fields.length >= 10}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No skills added</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  Add your skills to showcase your expertise
                </p>
                <Button onClick={addCategory} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Skill Category
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const categoryName = form.watch(`categories.${index}.name`);
                const skills = form.watch(`categories.${index}.skills`) || [];
                const suggestions = suggestedSkills[categoryName] || [];

                return (
                  <Card key={field.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name={`categories.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-1 mr-4">
                              <FormControl>
                                <Input
                                  placeholder="Category Name (e.g., Technical Skills)"
                                  className="text-lg font-semibold border-none px-0 focus-visible:ring-0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteIndex(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Current Skills */}
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, skillIndex) => (
                          <Badge
                            key={skillIndex}
                            variant="secondary"
                            className="text-sm py-1 px-3"
                          >
                            {skill}
                            <button
                              type="button"
                              className="ml-2 hover:text-destructive"
                              onClick={() => removeSkillFromCategory(index, skillIndex)}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      {/* Add Skill Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a skill..."
                          value={newSkill[field.id] || ''}
                          onChange={(e) =>
                            setNewSkill((prev) => ({
                              ...prev,
                              [field.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSkillToCategory(index);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => addSkillToCategory(index)}
                        >
                          Add
                        </Button>
                      </div>

                      {/* Suggestions */}
                      {suggestions.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Suggestions:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {suggestions
                              .filter((s) => !skills.includes(s))
                              .slice(0, 6)
                              .map((suggestion) => (
                                <Button
                                  key={suggestion}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    const currentSkills = form.getValues(
                                      `categories.${index}.skills`
                                    ) || [];
                                    form.setValue(`categories.${index}.skills`, [
                                      ...currentSkills,
                                      suggestion,
                                    ]);
                                  }}
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  {suggestion}
                                </Button>
                              ))}
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name={`categories.${index}.skills`}
                        render={() => <FormMessage />}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Save Button */}
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

      {/* Delete Confirmation */}
      <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category and all its skills?
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