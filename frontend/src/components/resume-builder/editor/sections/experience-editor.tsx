'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, ExperienceItem } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Briefcase,
  GripVertical,
  Sparkles,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const experienceItemSchema = z.object({
  id: z.string(),
  company: z.string().min(1, 'Company name is required').max(100),
  position: z.string().min(1, 'Position is required').max(100),
  location: z.string().max(100).optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  current: z.boolean().default(false),
  description: z.string().max(1000).optional().or(z.literal('')),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

const experienceFormSchema = z.object({
  experiences: z.array(experienceItemSchema).max(20),
});

type ExperienceFormData = z.infer<typeof experienceFormSchema>;

interface ExperienceEditorProps {
  resume: Resume;
  onSave: (data: ExperienceItem[]) => Promise<void>;
}

export function ExperienceEditor({ resume, onSave }: ExperienceEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const defaultExperiences: ExperienceItem[] = resume.content.experience || [];

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      experiences: defaultExperiences,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'experiences',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  const addExperience = () => {
    const newId = uuidv4();
    append({
      id: newId,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      highlights: [],
    });
    setExpandedItems([...expandedItems, newId]);
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const onSubmit = async (data: ExperienceFormData) => {
    const cleanedData = data.experiences.map((exp) => ({
      ...exp,
      location: exp.location || undefined,
      endDate: exp.current ? undefined : exp.endDate || undefined,
      description: exp.description || '',
      highlights: exp.highlights.filter((h) => h.trim() !== ''),
    }));

    updateContent({ experience: cleanedData });
    await onSave(cleanedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <p className="text-muted-foreground">
            Add your professional work history
          </p>
        </div>
        <Button onClick={addExperience} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No experience added</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  Add your work experience to showcase your professional journey
                </p>
                <Button onClick={addExperience} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Experience
                </Button>
              </CardContent>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <Accordion
                  type="multiple"
                  value={expandedItems}
                  onValueChange={setExpandedItems}
                  className="space-y-4"
                >
                  {fields.map((field, index) => (
                    <SortableExperienceCard
                      key={field.id}
                      id={field.id}
                      index={index}
                      form={form}
                      onDelete={() => setDeleteIndex(index)}
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>
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
            <AlertDialogTitle>Delete Experience</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this experience? This action cannot be undone.
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

interface SortableExperienceCardProps {
  id: string;
  index: number;
  form: any;
  onDelete: () => void;
}

function SortableExperienceCard({
  id,
  index,
  form,
  onDelete,
}: SortableExperienceCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const watchCompany = form.watch(`experiences.${index}.company`);
  const watchPosition = form.watch(`experiences.${index}.position`);
  const watchCurrent = form.watch(`experiences.${index}.current`);

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={id}
      className={`border rounded-lg ${isDragging ? 'opacity-50' : ''}`}
    >
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <div className="text-left">
            <p className="font-medium">
              {watchPosition || 'New Position'}
            </p>
            <p className="text-sm text-muted-foreground">
              {watchCompany || 'Company Name'}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name={`experiences.${index}.company`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company *</FormLabel>
                  <FormControl>
                    <Input placeholder="Company Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`experiences.${index}.position`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position *</FormLabel>
                  <FormControl>
                    <Input placeholder="Job Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`experiences.${index}.location`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-end">
              <FormField
                control={form.control}
                name={`experiences.${index}.current`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">I currently work here</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`experiences.${index}.startDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date *</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!watchCurrent && (
              <FormField
                control={form.control}
                name={`experiences.${index}.endDate`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="month" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <FormField
            control={form.control}
            name={`experiences.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your role and responsibilities..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <HighlightsEditor
            form={form}
            index={index}
          />

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function HighlightsEditor({ form, index }: { form: any; index: number }) {
  const highlights = form.watch(`experiences.${index}.highlights`) || [];

  const addHighlight = () => {
    const current = form.getValues(`experiences.${index}.highlights`) || [];
    form.setValue(`experiences.${index}.highlights`, [...current, '']);
  };

  const removeHighlight = (hIndex: number) => {
    const current = form.getValues(`experiences.${index}.highlights`) || [];
    form.setValue(
      `experiences.${index}.highlights`,
      current.filter((_: string, i: number) => i !== hIndex)
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>Key Achievements / Highlights</FormLabel>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addHighlight}
          disabled={highlights.length >= 10}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add
        </Button>
      </div>

      {highlights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add bullet points to highlight your key achievements
        </p>
      ) : (
        <div className="space-y-2">
          {highlights.map((_: string, hIndex: number) => (
            <div key={hIndex} className="flex gap-2">
              <FormField
                control={form.control}
                name={`experiences.${index}.highlights.${hIndex}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="e.g., Increased sales by 25% through..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeHighlight(hIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}