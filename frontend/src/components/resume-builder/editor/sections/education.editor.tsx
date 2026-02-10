'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, EducationItem } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  GraduationCap,
  GripVertical,
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

const educationItemSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, 'Institution name is required').max(100),
  degree: z.string().min(1, 'Degree is required').max(100),
  field: z.string().min(1, 'Field of study is required').max(100),
  location: z.string().max(100).optional().or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().or(z.literal('')),
  current: z.boolean().default(false),
  gpa: z.string().max(10).optional().or(z.literal('')),
  achievements: z.array(z.string().max(200)).max(5).optional(),
});

const educationFormSchema = z.object({
  educations: z.array(educationItemSchema).max(10),
});

type EducationFormData = z.infer<typeof educationFormSchema>;

interface EducationEditorProps {
  resume: Resume;
  onSave: (data: EducationItem[]) => Promise<void>;
}

export function EducationEditor({ resume, onSave }: EducationEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const defaultEducations: EducationItem[] = resume.content.education || [];

  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationFormSchema),
    defaultValues: {
      educations: defaultEducations,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'educations',
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

  const addEducation = () => {
    const newId = uuidv4();
    append({
      id: newId,
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      achievements: [],
    });
    setExpandedItems([...expandedItems, newId]);
  };

  const handleDelete = () => {
    if (deleteIndex !== null) {
      remove(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const onSubmit = async (data: EducationFormData) => {
    const cleanedData = data.educations.map((edu) => ({
      ...edu,
      location: edu.location || undefined,
      endDate: edu.current ? undefined : edu.endDate || undefined,
      gpa: edu.gpa || undefined,
      achievements: edu.achievements?.filter((a) => a.trim() !== '') || [],
    }));

    updateContent({ education: cleanedData });
    await onSave(cleanedData);
  };

  const degreeOptions = [
    'Bachelor of Science (B.S.)',
    'Bachelor of Arts (B.A.)',
    'Master of Science (M.S.)',
    'Master of Arts (M.A.)',
    'Master of Business Administration (MBA)',
    'Doctor of Philosophy (Ph.D.)',
    'Associate Degree',
    'High School Diploma',
    'Certificate',
    'Diploma',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Education</h2>
          <p className="text-muted-foreground">
            Add your educational background
          </p>
        </div>
        <Button onClick={addEducation} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No education added</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  Add your educational background and qualifications
                </p>
                <Button onClick={addEducation} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Education
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
                    <SortableEducationCard
                      key={field.id}
                      id={field.id}
                      index={index}
                      form={form}
                      degreeOptions={degreeOptions}
                      onDelete={() => setDeleteIndex(index)}
                    />
                  ))}
                </Accordion>
              </SortableContext>
            </DndContext>
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
            <AlertDialogTitle>Delete Education</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this education entry?
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

interface SortableEducationCardProps {
  id: string;
  index: number;
  form: any;
  degreeOptions: string[];
  onDelete: () => void;
}

function SortableEducationCard({
  id,
  index,
  form,
  degreeOptions,
  onDelete,
}: SortableEducationCardProps) {
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

  const watchInstitution = form.watch(`educations.${index}.institution`);
  const watchDegree = form.watch(`educations.${index}.degree`);
  const watchCurrent = form.watch(`educations.${index}.current`);

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
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <div className="text-left">
            <p className="font-medium">
              {watchDegree || 'New Degree'}
            </p>
            <p className="text-sm text-muted-foreground">
              {watchInstitution || 'Institution Name'}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name={`educations.${index}.institution`}
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Institution *</FormLabel>
                  <FormControl>
                    <Input placeholder="University/College Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`educations.${index}.degree`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Bachelor of Science" 
                      list={`degree-options-${index}`}
                      {...field} 
                    />
                  </FormControl>
                  <datalist id={`degree-options-${index}`}>
                    {degreeOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`educations.${index}.field`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field of Study *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`educations.${index}.location`}
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

            <FormField
              control={form.control}
              name={`educations.${index}.gpa`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPA / Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 3.8/4.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name={`educations.${index}.current`}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">I am currently studying here</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name={`educations.${index}.startDate`}
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
                name={`educations.${index}.endDate`}
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