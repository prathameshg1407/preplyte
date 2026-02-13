'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, CustomSection, CustomSectionItem } from '@/types/resume-builder.types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Layers,
  GripVertical,
} from 'lucide-react';

const customSectionItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  subtitle: z.string().max(100).optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
  description: z.string().max(500).optional().or(z.literal('')),
  bullets: z.array(z.string().max(300)).max(10).optional(),
});

const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Section title is required').max(50),
  items: z.array(customSectionItemSchema).max(20),
});

const customSectionsFormSchema = z.object({
  sections: z.array(customSectionSchema).max(5),
});

type CustomSectionsFormData = z.infer<typeof customSectionsFormSchema>;

interface CustomSectionsEditorProps {
  resume: Resume;
  onSave: (data: CustomSection[]) => Promise<void>;
}

export function CustomSectionsEditor({ resume, onSave }: CustomSectionsEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteSectionIndex, setDeleteSectionIndex] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const defaultSections: CustomSection[] = resume.content.customSections || [];

  const form = useForm<CustomSectionsFormData>({
    resolver: zodResolver(customSectionsFormSchema),
    defaultValues: {
      sections: defaultSections,
    },
  });

  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: 'sections',
  });

  const addSection = () => {
    const newId = uuidv4();
    appendSection({
      id: newId,
      title: '',
      items: [],
    });
    setExpandedSections([...expandedSections, newId]);
  };

  const handleDeleteSection = () => {
    if (deleteSectionIndex !== null) {
      removeSection(deleteSectionIndex);
      setDeleteSectionIndex(null);
    }
  };

  const addItemToSection = (sectionIndex: number) => {
    const currentItems = form.getValues(`sections.${sectionIndex}.items`) || [];
    form.setValue(`sections.${sectionIndex}.items`, [
      ...currentItems,
      {
        id: uuidv4(),
        title: '',
        subtitle: '',
        date: '',
        description: '',
        bullets: [],
      },
    ]);
  };

  const removeItemFromSection = (sectionIndex: number, itemIndex: number) => {
    const currentItems = form.getValues(`sections.${sectionIndex}.items`) || [];
    form.setValue(
      `sections.${sectionIndex}.items`,
      currentItems.filter((_, i) => i !== itemIndex)
    );
  };

  const onSubmit = async (data: CustomSectionsFormData) => {
    try {
      console.log('Custom Sections - Form data:', data);
      
      const cleanedData = data.sections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          subtitle: item.subtitle || undefined,
          date: item.date || undefined,
          description: item.description || undefined,
          bullets: item.bullets?.filter((b) => b.trim() !== '') || [],
        })),
      }));

      console.log('Custom Sections - Cleaned data:', cleanedData);
      
      updateContent({ customSections: cleanedData });
      
      console.log('Custom Sections - Calling onSave...');
      await onSave(cleanedData);
      console.log('Custom Sections - Save successful!');
    } catch (error) {
      console.error('Custom Sections - Save error:', error);
      throw error;
    }
  };

  const sectionSuggestions = [
    'Volunteer Experience',
    'Publications',
    'Presentations',
    'Research',
    'Interests',
    'References',
    'Memberships',
    'Conferences',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Custom Sections</h2>
          <p className="text-muted-foreground">
            Create your own sections for additional information
          </p>
        </div>
        <Button onClick={addSection} variant="outline" disabled={sectionFields.length >= 5}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {sectionFields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No custom sections</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
                  Create custom sections for information that doesn&apos;t fit in standard categories
                </p>
                <Button onClick={addSection} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Custom Section
                </Button>

                {/* Section Suggestions */}
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Popular custom sections:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {sectionSuggestions.slice(0, 4).map((suggestion) => (
                      <Button
                        key={suggestion}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newId = uuidv4();
                          appendSection({
                            id: newId,
                            title: suggestion,
                            items: [],
                          });
                          setExpandedSections([...expandedSections, newId]);
                        }}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Accordion
              type="multiple"
              value={expandedSections}
              onValueChange={setExpandedSections}
              className="space-y-4"
            >
              {sectionFields.map((section, sectionIndex) => {
                const items = form.watch(`sections.${sectionIndex}.items`) || [];

                return (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="border rounded-lg"
                  >
                                        <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {form.watch(`sections.${sectionIndex}.title`) || 'Untitled Section'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({items.length} items)
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-4 pt-4">
                        {/* Section Title */}
                        <div className="flex items-center gap-4">
                          <FormField
                            control={form.control}
                            name={`sections.${sectionIndex}.title`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Section Title *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Volunteer Experience"
                                    list={`section-suggestions-${sectionIndex}`}
                                    {...field}
                                  />
                                </FormControl>
                                <datalist id={`section-suggestions-${sectionIndex}`}>
                                  {sectionSuggestions.map((suggestion) => (
                                    <option key={suggestion} value={suggestion} />
                                  ))}
                                </datalist>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="mt-6"
                            onClick={() => setDeleteSectionIndex(sectionIndex)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Section
                          </Button>
                        </div>

                        {/* Section Items */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Items</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addItemToSection(sectionIndex)}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Item
                            </Button>
                          </div>

                          {items.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                No items yet. Add your first item to this section.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {items.map((item: any, itemIndex: number) => (
                                <CustomSectionItemEditor
                                  key={item.id}
                                  form={form}
                                  sectionIndex={sectionIndex}
                                  itemIndex={itemIndex}
                                  onRemove={() => removeItemFromSection(sectionIndex, itemIndex)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {sectionFields.length > 0 && (
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

      <AlertDialog
        open={deleteSectionIndex !== null}
        onOpenChange={() => setDeleteSectionIndex(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Section</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this section and all its items?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSection} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface CustomSectionItemEditorProps {
  form: any;
  sectionIndex: number;
  itemIndex: number;
  onRemove: () => void;
}

function CustomSectionItemEditor({
  form,
  sectionIndex,
  itemIndex,
  onRemove,
}: CustomSectionItemEditorProps) {
  const bullets = form.watch(`sections.${sectionIndex}.items.${itemIndex}.bullets`) || [];

  const addBullet = () => {
    const current = form.getValues(`sections.${sectionIndex}.items.${itemIndex}.bullets`) || [];
    form.setValue(`sections.${sectionIndex}.items.${itemIndex}.bullets`, [...current, '']);
  };

  const removeBullet = (bulletIndex: number) => {
    const current = form.getValues(`sections.${sectionIndex}.items.${itemIndex}.bullets`) || [];
    form.setValue(
      `sections.${sectionIndex}.items.${itemIndex}.bullets`,
      current.filter((_: string, i: number) => i !== bulletIndex)
    );
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">
            Item {itemIndex + 1}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name={`sections.${sectionIndex}.items.${itemIndex}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input placeholder="Item title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`sections.${sectionIndex}.items.${itemIndex}.subtitle`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitle</FormLabel>
                <FormControl>
                  <Input placeholder="Organization, location, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`sections.${sectionIndex}.items.${itemIndex}.date`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2020 - Present" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`sections.${sectionIndex}.items.${itemIndex}.description`}
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description..."
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bullet Points */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Bullet Points</FormLabel>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addBullet}
              disabled={bullets.length >= 10}
            >
              <Plus className="mr-1 h-3 w-3" />
              Add
            </Button>
          </div>

          {bullets.length > 0 && (
            <div className="space-y-2">
              {bullets.map((_: string, bulletIndex: number) => (
                <div key={bulletIndex} className="flex gap-2">
                  <FormField
                    control={form.control}
                    name={`sections.${sectionIndex}.items.${itemIndex}.bullets.${bulletIndex}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Bullet point..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBullet(bulletIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}