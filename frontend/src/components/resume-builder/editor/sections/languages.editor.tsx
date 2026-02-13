'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, LanguageItem } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Loader2, Save, Plus, Trash2, Languages, Globe } from 'lucide-react';

const proficiencyLevels = [
  { value: 'native', label: 'Native', description: 'First language' },
  { value: 'fluent', label: 'Fluent', description: 'Full professional proficiency' },
  { value: 'advanced', label: 'Advanced', description: 'Professional working proficiency' },
  { value: 'intermediate', label: 'Intermediate', description: 'Limited working proficiency' },
  { value: 'basic', label: 'Basic', description: 'Elementary proficiency' },
] as const;

const languageItemSchema = z.object({
  id: z.string(),
  language: z.string().min(1, 'Language is required').max(50),
  proficiency: z.enum(['native', 'fluent', 'advanced', 'intermediate', 'basic']),
});

const languagesFormSchema = z.object({
  languages: z.array(languageItemSchema).max(10),
});

type LanguagesFormData = z.infer<typeof languagesFormSchema>;

interface LanguagesEditorProps {
  resume: Resume;
  onSave: (data: LanguageItem[]) => Promise<void>;
}

export function LanguagesEditor({ resume, onSave }: LanguagesEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const defaultLanguages: LanguageItem[] = resume.content.languages || [];

  const form = useForm<LanguagesFormData>({
    resolver: zodResolver(languagesFormSchema),
    defaultValues: {
      languages: defaultLanguages,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'languages',
  });

  const addLanguage = () => {
    append({
      id: uuidv4(),
      language: '',
      proficiency: 'intermediate',
    });
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const onSubmit = async (data: LanguagesFormData) => {
    updateContent({ languages: data.languages });
    await onSave(data.languages);
  };

  const commonLanguages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Mandarin Chinese',
    'Japanese',
    'Korean',
    'Portuguese',
    'Italian',
    'Russian',
    'Arabic',
    'Hindi',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Languages</h2>
          <p className="text-muted-foreground">
            Add languages you speak and your proficiency level
          </p>
        </div>
        <Button onClick={addLanguage} variant="outline" disabled={fields.length >= 10}>
          <Plus className="mr-2 h-4 w-4" />
          Add Language
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Languages className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No languages added</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  Add languages you speak to showcase your communication abilities
                </p>
                <Button onClick={addLanguage} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Language
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-4">
                      <Globe className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      
                      <div className="flex-1 grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`languages.${index}.language`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">Language</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Language" 
                                  list={`language-suggestions-${index}`}
                                  {...field} 
                                />
                              </FormControl>
                              <datalist id={`language-suggestions-${index}`}>
                                {commonLanguages.map((lang) => (
                                  <option key={lang} value={lang} />
                                ))}
                              </datalist>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`languages.${index}.proficiency`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="sr-only">Proficiency</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select proficiency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {proficiencyLevels.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      <div className="flex flex-col">
                                        <span>{level.label}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {level.description}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteIndex(index)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Proficiency Guide */}
          {fields.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <h4 className="font-medium mb-3">Proficiency Levels Guide</h4>
                <div className="grid gap-2 text-sm">
                  {proficiencyLevels.map((level) => (
                    <div key={level.value} className="flex gap-2">
                      <span className="font-medium w-24">{level.label}:</span>
                      <span className="text-muted-foreground">{level.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            <AlertDialogTitle>Delete Language</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this language?
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