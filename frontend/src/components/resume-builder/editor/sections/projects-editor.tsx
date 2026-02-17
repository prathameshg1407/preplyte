'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Resume, ProjectItem } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
  FolderKanban,
  GripVertical,
  Link,
  Github,
  X,
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

const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000),
  technologies: z.array(z.string().max(30)).max(15),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  github: z.string().url('Invalid URL').optional().or(z.literal('')),
  startDate: z.string().optional().or(z.literal('')),
  endDate: z.string().optional().or(z.literal('')),
  highlights: z.array(z.string().max(500)).max(10).default([]),
});

const projectsFormSchema = z.object({
  projects: z.array(projectItemSchema).max(15),
});

type ProjectsFormData = z.infer<typeof projectsFormSchema>;

interface ProjectsEditorProps {
  resume: Resume;
  onSave: (data: ProjectItem[]) => Promise<void>;
}

export function ProjectsEditor({ resume, onSave }: ProjectsEditorProps) {
  const { updateContent, isSaving } = useResumeStore();
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [newTech, setNewTech] = useState<Record<string, string>>({});

  const defaultProjects: ProjectItem[] = resume.content.projects || [];

  const form = useForm<ProjectsFormData>({
    resolver: zodResolver(projectsFormSchema),
    defaultValues: {
      projects: defaultProjects,
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'projects',
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

  const addProject = () => {
    const newId = uuidv4();
    append({
      id: newId,
      name: '',
      description: '',
      technologies: [],
      url: '',
      github: '',
      startDate: '',
      endDate: '',
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

  const addTechnology = (projectIndex: number) => {
    const tech = newTech[fields[projectIndex].id]?.trim();
    if (!tech) return;

    const currentTech = form.getValues(`projects.${projectIndex}.technologies`) || [];
    if (!currentTech.includes(tech) && currentTech.length < 15) {
      form.setValue(`projects.${projectIndex}.technologies`, [...currentTech, tech]);
    }
    setNewTech((prev) => ({ ...prev, [fields[projectIndex].id]: '' }));
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const currentTech = form.getValues(`projects.${projectIndex}.technologies`) || [];
    form.setValue(
      `projects.${projectIndex}.technologies`,
      currentTech.filter((_, i) => i !== techIndex)
    );
  };

  const onSubmit = async (data: ProjectsFormData) => {
    const cleanedData = data.projects.map((project) => ({
      ...project,
      url: project.url || undefined,
      github: project.github || undefined,
      startDate: project.startDate || undefined,
      endDate: project.endDate || undefined,
      highlights: project.highlights.filter((h) => h.trim() !== ''),
    }));

    updateContent({ projects: cleanedData });
    await onSave(cleanedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">
            Showcase your personal and professional projects
          </p>
        </div>
        <Button onClick={addProject} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-semibold">No projects added</h3>
                <p className="mt-2 text-sm text-muted-foreground text-center">
                  Add your projects to demonstrate your skills and experience
                </p>
                <Button onClick={addProject} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Project
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
                    <SortableProjectCard
                      key={field.id}
                      id={field.id}
                      index={index}
                      form={form}
                      newTech={newTech}
                      setNewTech={setNewTech}
                      onAddTechnology={() => addTechnology(index)}
                      onRemoveTechnology={(techIndex) => removeTechnology(index, techIndex)}
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
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project?
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

interface SortableProjectCardProps {
  id: string;
  index: number;
  form: any;
  newTech: Record<string, string>;
  setNewTech: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onAddTechnology: () => void;
  onRemoveTechnology: (techIndex: number) => void;
  onDelete: () => void;
}

function SortableProjectCard({
  id,
  index,
  form,
  newTech,
  setNewTech,
  onAddTechnology,
  onRemoveTechnology,
  onDelete,
}: SortableProjectCardProps) {
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

  const watchName = form.watch(`projects.${index}.name`);
  const watchTechnologies = form.watch(`projects.${index}.technologies`) || [];

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
          <FolderKanban className="h-4 w-4 text-muted-foreground" />
          <div className="text-left flex-1">
            <p className="font-medium">
              {watchName || 'New Project'}
            </p>
            {watchTechnologies.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {watchTechnologies.slice(0, 3).join(', ')}
                {watchTechnologies.length > 3 && ` +${watchTechnologies.length - 3} more`}
              </p>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-4">
          <FormField
            control={form.control}
            name={`projects.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name *</FormLabel>
                <FormControl>
                  <Input placeholder="My Awesome Project" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`projects.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe what the project does and its key features..."
                    className="min-h-24"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Technologies */}
          <div className="space-y-2">
            <FormLabel>Technologies Used</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {watchTechnologies.map((tech: string, techIndex: number) => (
                <Badge
                  key={techIndex}
                  variant="secondary"
                  className="text-sm py-1 px-3"
                >
                  {tech}
                  <button
                    type="button"
                    className="ml-2 hover:text-destructive"
                    onClick={() => onRemoveTechnology(techIndex)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a technology..."
                value={newTech[id] || ''}
                onChange={(e) =>
                  setNewTech((prev) => ({ ...prev, [id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onAddTechnology();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={onAddTechnology}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name={`projects.${index}.url`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Live URL
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://myproject.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`projects.${index}.github`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub URL
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/user/repo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name={`projects.${index}.startDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`projects.${index}.endDate`}
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
          </div>

          {/* Highlights */}
          <ProjectHighlightsEditor form={form} index={index} />

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

function ProjectHighlightsEditor({ form, index }: { form: any; index: number }) {
  const highlights = form.watch(`projects.${index}.highlights`) || [];

  const addHighlight = () => {
    const current = form.getValues(`projects.${index}.highlights`) || [];
    form.setValue(`projects.${index}.highlights`, [...current, '']);
  };

  const removeHighlight = (hIndex: number) => {
    const current = form.getValues(`projects.${index}.highlights`) || [];
    form.setValue(
      `projects.${index}.highlights`,
      current.filter((_: string, i: number) => i !== hIndex)
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>Key Features / Highlights</FormLabel>
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
          Add bullet points to highlight key features
        </p>
      ) : (
        <div className="space-y-2">
          {highlights.map((_: string, hIndex: number) => (
            <div key={hIndex} className="flex gap-2">
              <FormField
                control={form.control}
                name={`projects.${index}.highlights.${hIndex}`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        placeholder="e.g., Implemented real-time chat using WebSockets"
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