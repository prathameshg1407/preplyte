'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLmsCategories } from '@/lib/hooks/admin/use-lms-admin';
import { DifficultyLevel, LmsCourseStatus } from '@/types/lms.types';
import { CreateCourseDto } from '@/types/lms-admin.types';
import { Loader2, Plus, Trash2, GripVertical, FileText, Video, HelpCircle, Layout, Settings, Link2 } from 'lucide-react';
import { LocalTestQuestionsManager } from './local-test-questions-manager';

const topicSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, 'Topic title must be at least 2 characters'),
    description: z.string().nullable().optional(),
    theoryContent: z.string().nullable().optional(),
    videoUrl: z.string().url().nullable().optional().or(z.literal('')),
    estimatedMinutes: z.coerce.number().min(0).default(10),
    order: z.number().default(0),
    videoDuration: z.coerce.number().min(0).optional(),
    isActive: z.boolean().default(true),
    resources: z.array(z.object({
        name: z.string().min(1, 'Resource name is required'),
        url: z.string().url('Invalid URL'),
        type: z.enum(['pdf', 'link', 'file']),
    })).optional().default([]),
});

const questionOptionSchema = z.object({
    id: z.string().optional(),
    text: z.string().min(1, 'Option text required'),
    isCorrect: z.boolean().default(false),
    order: z.number().default(0),
});

const questionSchema = z.object({
    id: z.string().optional(),
    questionText: z.string().min(1, 'Question text required'),
    explanation: z.string().optional().nullable(),
    order: z.number().default(0),
    points: z.number().min(1).default(1),
    isActive: z.boolean().default(true),
    options: z.array(questionOptionSchema).min(2, 'At least 2 options required'),
});

const moduleTestSchema = z.object({
    title: z.string().min(2, 'Test title must be at least 2 characters'),
    totalQuestions: z.coerce.number().min(1).default(5),
    passingScore: z.coerce.number().min(0).max(100).default(60),
    timeLimitMinutes: z.coerce.number().min(1).default(15),
    pointsPerQuestion: z.coerce.number().min(0).default(10),
    isActive: z.boolean().default(true),
    questions: z.array(questionSchema).optional().default([]),
});

const moduleSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(2, 'Module title must be at least 2 characters'),
    shortDescription: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    points: z.coerce.number().min(0).default(0),
    estimatedMinutes: z.coerce.number().min(0).default(0),
    order: z.number().default(0),
    isActive: z.boolean().default(true),
    topics: z.array(topicSchema).default([]),
    moduleTest: moduleTestSchema.nullable().optional(),
});

const finalTestSchema = z.object({
    title: z.string().min(2, 'Test title must be at least 2 characters'),
    totalQuestions: z.coerce.number().min(1).default(10),
    passingScore: z.coerce.number().min(0).max(100).default(60),
    timeLimitMinutes: z.coerce.number().min(1).default(30),
    questions: z.array(questionSchema).optional().default([]),
});

const courseSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    categoryId: z.string().min(1, 'Category is required'),
    shortDescription: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    currency: z.string().default('INR'),
    status: z.nativeEnum(LmsCourseStatus),
    difficulty: z.nativeEnum(DifficultyLevel),
    isActive: z.boolean().default(true),
    certificateEnabled: z.boolean().default(false),
    passingPercentage: z.coerce.number().min(0).max(100).default(70),
    instructor: z.string().nullable().optional(),
    thumbnailUrl: z.string().url().nullable().optional().or(z.literal('')),
    previewVideoUrl: z.string().url().nullable().optional().or(z.literal('')),
    language: z.string().default('English'),
    tags: z.string().nullable().optional(), // Comma separated for UI
    modules: z.array(moduleSchema).default([]),
    finalTest: finalTestSchema.nullable().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
    initialData?: Partial<CreateCourseDto>;
    onSubmit: (data: CourseFormValues) => void;
    isLoading?: boolean;
}

export function CourseForm({ initialData, onSubmit, isLoading }: CourseFormProps) {
    const { data: categoriesData, isLoading: categoriesLoading } = useLmsCategories();

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: initialData?.title || '',
            slug: initialData?.slug || '',
            categoryId: initialData?.categoryId || '',
            shortDescription: initialData?.shortDescription || '',
            description: initialData?.description || '',
            price: initialData?.price || 0,
            discountPrice: initialData?.discountPrice || 0,
            currency: initialData?.currency || 'INR',
            status: initialData?.status || LmsCourseStatus.DRAFT,
            difficulty: initialData?.difficulty || DifficultyLevel.EASY,
            isActive: initialData?.isActive ?? true,
            certificateEnabled: initialData?.certificateEnabled ?? false,
            passingPercentage: initialData?.passingPercentage || 70,
            instructor: initialData?.instructor || '',
            thumbnailUrl: initialData?.thumbnailUrl || '',
            previewVideoUrl: initialData?.previewVideoUrl || '',
            language: initialData?.language || 'English',
            tags: initialData?.tags?.join(', ') || '',
            modules: [],
            finalTest: {
                title: 'Final Examination',
                totalQuestions: 10,
                passingScore: 60,
                timeLimitMinutes: 30
            }
        },
    });

    const { fields: moduleFields, append: appendModule, remove: removeModule } = useFieldArray({
        control: form.control,
        name: 'modules',
    });

    const categories = categoriesData?.data || [];

    // Reset form when initialData changes to ensure all fields are populated
    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title || '',
                slug: initialData.slug || '',
                categoryId: initialData.categoryId || '',
                shortDescription: initialData.shortDescription || '',
                description: initialData.description || '',
                price: initialData.price || 0,
                discountPrice: initialData.discountPrice || 0,
                currency: initialData.currency || 'INR',
                status: initialData.status || LmsCourseStatus.DRAFT,
                difficulty: initialData.difficulty || DifficultyLevel.EASY,
                isActive: initialData.isActive ?? true,
                certificateEnabled: initialData.certificateEnabled ?? false,
                passingPercentage: initialData.passingPercentage || 70,
                instructor: initialData.instructor || '',
                thumbnailUrl: initialData.thumbnailUrl || '',
                previewVideoUrl: initialData.previewVideoUrl || '',
                language: initialData.language || 'English',
                tags: initialData.tags?.join(', ') || '',
                modules: initialData.modules || [],
                finalTest: initialData.finalTest || {
                    title: 'Final Examination',
                    totalQuestions: 10,
                    passingScore: 60,
                    timeLimitMinutes: 30
                }
            });
        }
    }, [initialData, form]);

    const handleFormSubmit = (values: CourseFormValues) => {
        // Transform tags back to array
        const tagsArray = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        onSubmit({ ...values, tags: tagsArray as any });
    };

    const findFirstErrorMessage = (obj: any): string | null => {
        if (!obj) return null;
        if (obj.message && typeof obj.message === 'string') return obj.message;

        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                const nested = findFirstErrorMessage(obj[key]);
                if (nested) return nested;
            }
        }

        return null;
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(
                    handleFormSubmit,
                    (err) => {
                        console.error('Submit Errors:', err);
                        const firstError = findFirstErrorMessage(err);
                        toast.error(firstError ? `Validation Error: ${firstError}` : 'Please check all fields. Some required info is missing.');
                    }
                )}
                className="space-y-8"
            >
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="general">
                            <Layout className="h-4 w-4 mr-2" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="curriculum">
                            <FileText className="h-4 w-4 mr-2" />
                            Curriculum
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>Fundamental details about your course.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Course Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter course title" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="course-url-slug" {...field} />
                                                </FormControl>
                                                <FormDescription>The URL-friendly name for this course.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={categoriesLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem key={category.id} value={category.id}>
                                                                {category.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="language"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Language</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="English" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Media & Content</CardTitle>
                                    <CardDescription>Visuals and descriptions for the landing page.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="shortDescription"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Short Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief overview..."
                                                        className="min-h-[80px]"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormDescription>A quick summary visible on cards.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Detailed description..."
                                                        className="min-h-[150px]"
                                                        {...field}
                                                        value={field.value || ''}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="thumbnailUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Thumbnail URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://..." {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="previewVideoUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Preview Video URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://youtube.com/..." {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="settings" className="space-y-6 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing & Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price (INR)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? 0} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="discountPrice"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Discount Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="difficulty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Difficulty</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select level" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={DifficultyLevel.EASY}>Easy</SelectItem>
                                                        <SelectItem value={DifficultyLevel.MEDIUM}>Medium</SelectItem>
                                                        <SelectItem value={DifficultyLevel.HARD}>Hard</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={LmsCourseStatus.DRAFT}>Draft</SelectItem>
                                                        <SelectItem value={LmsCourseStatus.PUBLISHED}>Published</SelectItem>
                                                        <SelectItem value={LmsCourseStatus.ARCHIVED}>Archived</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Advanced Options</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="instructor"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Instructor</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags (Comma separated)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="react, web, lms" {...field} value={Array.isArray(field.value) ? field.value.join(', ') : (field.value ?? '')} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex flex-col gap-4 pt-4 border-t mt-4">
                                        <FormField
                                            control={form.control}
                                            name="isActive"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Active Visibility</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="certificateEnabled"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Enable Certificate</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {form.watch('certificateEnabled') && (
                                            <FormField
                                                control={form.control}
                                                name="passingPercentage"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passing % for Certificate</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} value={field.value ?? 60} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2 border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HelpCircle className="h-5 w-5" />
                                        Final Test Configuration
                                    </CardTitle>
                                    <CardDescription>Setup the final exam required to complete the course.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name={"finalTest.title" as any}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Test Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Final Examination" {...field} value={field.value || ''} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={"finalTest.totalQuestions" as any}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Questions Count</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || 0} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={"finalTest.passingScore" as any}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Passing Score (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} value={field.value || 0} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="pt-4 border-t border-dashed border-primary/30">
                                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Final Test Questions
                                        </h4>
                                        <LocalTestQuestionsManager
                                            questions={form.watch('finalTest.questions' as any) || []}
                                            onChange={(qs) => form.setValue('finalTest.questions' as any, qs as any)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="curriculum" className="space-y-6 mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Course Curriculum</CardTitle>
                                    <CardDescription>Structure your course with modules and topics.</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendModule({
                                        title: '',
                                        shortDescription: '',
                                        points: 0,
                                        estimatedMinutes: 0,
                                        order: moduleFields.length + 1,
                                        isActive: true,
                                        topics: []
                                    })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Module
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {moduleFields.length === 0 ? (
                                    <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/50">
                                        <Layout className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-20" />
                                        <p className="text-muted-foreground">No modules added yet. Start by adding your first module.</p>
                                    </div>
                                ) : (
                                    <Accordion type="multiple" className="space-y-4">
                                        {moduleFields.map((module, moduleIndex) => (
                                            <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4 bg-card">
                                                <div className="flex items-center gap-2 py-2">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                                    <AccordionTrigger className="flex-1 hover:no-underline py-2">
                                                        <div className="flex items-center gap-3 text-left">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">
                                                                {moduleIndex + 1}
                                                            </div>
                                                            <span className="font-semibold text-sm">
                                                                {form.watch(`modules.${moduleIndex}.title`) || `Untitled Module ${moduleIndex + 1}`}
                                                            </span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeModule(moduleIndex)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <AccordionContent className="pb-4 pt-2 space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`modules.${moduleIndex}.title`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs">Module Title</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Fundamentals of..." {...field} className="h-8 text-sm" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`modules.${moduleIndex}.points`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs">Points</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" {...field} value={field.value ?? 0} className="h-8 text-sm" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={form.control}
                                                            name={`modules.${moduleIndex}.estimatedMinutes`}
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-xs">Estimated Minutes</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="number" {...field} value={field.value ?? 0} className="h-8 text-sm" />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={form.control}
                                                            name={`modules.${moduleIndex}.isActive`}
                                                            render={({ field }) => (
                                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-2 h-10 mt-5">
                                                                    <FormLabel className="text-xs">Active Module</FormLabel>
                                                                    <FormControl>
                                                                        <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                                                                    </FormControl>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                    <FormField
                                                        control={form.control}
                                                        name={`modules.${moduleIndex}.shortDescription`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Short Description</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="What will they learn?" {...field} value={field.value ?? ''} className="min-h-[60px] text-sm resize-none" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`modules.${moduleIndex}.description`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-xs">Detailed Description (Optional)</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="Full details about this module..." {...field} value={field.value ?? ''} className="min-h-[100px] text-sm" />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <div className="border rounded-md p-3 bg-primary/5 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <HelpCircle className="h-4 w-4 text-primary" />
                                                                <span className="text-xs font-bold">Module Test</span>
                                                            </div>
                                                            <Switch
                                                                checked={!!form.watch(`modules.${moduleIndex}.moduleTest` as any)}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        form.setValue(`modules.${moduleIndex}.moduleTest` as any, {
                                                                            title: `Test for ${form.getValues(`modules.${moduleIndex}.title` as any)}`,
                                                                            totalQuestions: 5,
                                                                            passingScore: 60,
                                                                            timeLimitMinutes: 15,
                                                                            pointsPerQuestion: 10,
                                                                            isActive: true
                                                                        });
                                                                    } else {
                                                                        form.setValue(`modules.${moduleIndex}.moduleTest` as any, null);
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        {form.watch(`modules.${moduleIndex}.moduleTest` as any) && (
                                                            <>
                                                                <div className="grid grid-cols-2 gap-3 pt-2">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`modules.${moduleIndex}.moduleTest.title` as any}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-[10px]">Test Title</FormLabel>
                                                                                <FormControl>
                                                                                    <Input {...field} value={field.value || ''} className="h-7 text-xs bg-card" />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`modules.${moduleIndex}.moduleTest.totalQuestions` as any}
                                                                        render={({ field }) => (
                                                                            <FormItem>
                                                                                <FormLabel className="text-[10px]">Questions</FormLabel>
                                                                                <FormControl>
                                                                                    <Input type="number" {...field} value={field.value || 0} className="h-7 text-xs bg-card" />
                                                                                </FormControl>
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                </div>

                                                                <div className="mt-4 pt-2 border-t border-dashed">
                                                                    <h5 className="text-xs font-bold mb-2">Test Questions</h5>
                                                                    <LocalTestQuestionsManager
                                                                        questions={form.watch(`modules.${moduleIndex}.moduleTest.questions` as any) || []}
                                                                        onChange={(qs) => form.setValue(`modules.${moduleIndex}.moduleTest.questions` as any, qs as any)}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Topics Section */}
                                                    <div className="space-y-3 mt-4 pt-4 border-t">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                                <FileText className="h-3 w-3" />
                                                                Topics in this Module
                                                            </h4>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() => {
                                                                    const currentTopics = form.getValues(`modules.${moduleIndex}.topics`) || [];
                                                                    form.setValue(`modules.${moduleIndex}.topics`, [
                                                                        ...currentTopics,
                                                                        { title: '', theoryContent: '', order: currentTopics.length + 1, estimatedMinutes: 10, isActive: true, resources: [] }
                                                                    ]);
                                                                }}
                                                            >
                                                                <Plus className="h-3 w-3 mr-1" />
                                                                Add Topic
                                                            </Button>
                                                        </div>

                                                        <div className="space-y-2">
                                                            {(form.watch(`modules.${moduleIndex}.topics`) || []).map((_, topicIndex) => (
                                                                <div key={topicIndex} className="bg-muted/30 p-3 rounded border space-y-3 relative group">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                                                                        onClick={() => {
                                                                            const currentTopics = form.getValues(`modules.${moduleIndex}.topics`);
                                                                            form.setValue(`modules.${moduleIndex}.topics`, currentTopics.filter((__, i) => i !== topicIndex));
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`modules.${moduleIndex}.topics.${topicIndex}.title`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-1">
                                                                                <FormLabel className="text-[10px] text-muted-foreground">Topic Title</FormLabel>
                                                                                <FormControl>
                                                                                    <Input placeholder="Enter topic title" {...field} value={field.value ?? ''} className="h-7 text-xs bg-card" />
                                                                                </FormControl>
                                                                                <FormMessage className="text-[10px]" />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <div className="grid grid-cols-3 gap-3">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.videoUrl`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-1 col-span-1">
                                                                                    <FormLabel className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                                        <Video className="h-2 w-2" />
                                                                                        Video URL
                                                                                    </FormLabel>
                                                                                    <FormControl>
                                                                                        <Input placeholder="https://..." {...field} value={field.value ?? ''} className="h-7 text-xs bg-card" />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.videoDuration`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-1 col-span-1">
                                                                                    <FormLabel className="text-[10px] text-muted-foreground">Video Secs</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input type="number" {...field} value={field.value ?? 0} className="h-7 text-xs bg-card" />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.estimatedMinutes`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-1 col-span-1">
                                                                                    <FormLabel className="text-[10px] text-muted-foreground">Total Min</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input type="number" {...field} value={field.value ?? 10} className="h-7 text-xs bg-card" />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </div>
                                                                    <div className="flex justify-start">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.isActive`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="flex flex-row items-center justify-between rounded border p-1 h-7 bg-card w-[100px]">
                                                                                    <FormLabel className="text-[10px] text-muted-foreground">Active</FormLabel>
                                                                                    <FormControl>
                                                                                        <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-[0.5]" />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                    </div>

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`modules.${moduleIndex}.topics.${topicIndex}.theoryContent`}
                                                                        render={({ field }) => (
                                                                            <FormItem className="space-y-1">
                                                                                <FormLabel className="text-[10px] text-muted-foreground">Theory Content (Markdown)</FormLabel>
                                                                                <FormControl>
                                                                                    <Textarea placeholder="Topic body content..." {...field} value={field.value ?? ''} className="min-h-[80px] text-xs resize-none bg-card" />
                                                                                </FormControl>
                                                                                <FormMessage className="text-[10px]" />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    {/* Topic Resources */}
                                                                    <div className="space-y-2 pt-2 border-t border-dashed">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                                                                <Link2 className="h-2 w-2" />
                                                                                Resources
                                                                            </span>
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-5 text-[9px] px-2"
                                                                                onClick={() => {
                                                                                    const currentRes = form.getValues(`modules.${moduleIndex}.topics.${topicIndex}.resources`) || [];
                                                                                    form.setValue(`modules.${moduleIndex}.topics.${topicIndex}.resources`, [
                                                                                        ...currentRes,
                                                                                        { name: '', url: '', type: 'link' }
                                                                                    ]);
                                                                                }}
                                                                            >
                                                                                <Plus className="h-2 w-2 mr-1" />
                                                                                Add
                                                                            </Button>
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            {(form.watch(`modules.${moduleIndex}.topics.${topicIndex}.resources`) || []).map((_, resIndex) => (
                                                                                <div key={resIndex} className="grid grid-cols-12 gap-1 items-center bg-card/50 p-1 rounded border border-dashed">
                                                                                    <div className="col-span-4">
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.resources.${resIndex}.name`}
                                                                                            render={({ field }) => (
                                                                                                <FormControl>
                                                                                                    <Input placeholder="Name" {...field} value={field.value ?? ''} className="h-6 text-[9px] px-1" />
                                                                                                </FormControl>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="col-span-4">
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.resources.${resIndex}.url`}
                                                                                            render={({ field }) => (
                                                                                                <FormControl>
                                                                                                    <Input placeholder="URL" {...field} value={field.value ?? ''} className="h-6 text-[9px] px-1" />
                                                                                                </FormControl>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="col-span-3">
                                                                                        <FormField
                                                                                            control={form.control}
                                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.resources.${resIndex}.type`}
                                                                                            render={({ field }) => (
                                                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                                                    <FormControl>
                                                                                                        <SelectTrigger className="h-6 text-[9px] px-1">
                                                                                                            <SelectValue placeholder="Type" />
                                                                                                        </SelectTrigger>
                                                                                                    </FormControl>
                                                                                                    <SelectContent>
                                                                                                        <SelectItem value="link">Link</SelectItem>
                                                                                                        <SelectItem value="pdf">PDF</SelectItem>
                                                                                                        <SelectItem value="file">File</SelectItem>
                                                                                                    </SelectContent>
                                                                                                </Select>
                                                                                            )}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="col-span-1 flex justify-center">
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-5 w-5 text-destructive"
                                                                                            onClick={() => {
                                                                                                const currentRes = form.getValues(`modules.${moduleIndex}.topics.${topicIndex}.resources`);
                                                                                                form.setValue(`modules.${moduleIndex}.topics.${topicIndex}.resources`, currentRes.filter((__, i) => i !== resIndex));
                                                                                            }}
                                                                                        >
                                                                                            <Trash2 className="h-2 w-2" />
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-4 border-t pt-6 bg-background sticky bottom-0 z-10">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Course' : 'Create Course'}
                    </Button>
                </div>
            </form>
        </Form >
    );
};
