'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Loader2, Plus, Trash2, GripVertical, FileText, Video, HelpCircle, Layout, Settings } from 'lucide-react';

const topicSchema = z.object({
    title: z.string().min(2, 'Topic title must be at least 2 characters'),
    description: z.string().optional(),
    theoryContent: z.string().min(5, 'Theory content is required'),
    videoUrl: z.string().url().optional().or(z.literal('')),
    estimatedMinutes: z.coerce.number().min(1).default(10),
    order: z.number().default(0),
});

const moduleTestSchema = z.object({
    title: z.string().min(2, 'Test title must be at least 2 characters'),
    totalQuestions: z.coerce.number().min(1).default(5),
    passingScore: z.coerce.number().min(0).max(100).default(60),
    timeLimitMinutes: z.coerce.number().min(1).default(15),
    pointsPerQuestion: z.coerce.number().min(0).default(10),
    isActive: z.boolean().default(true),
});

const moduleSchema = z.object({
    title: z.string().min(2, 'Module title must be at least 2 characters'),
    shortDescription: z.string().min(5, 'Short description is required'),
    description: z.string().optional(),
    points: z.coerce.number().min(0).default(0),
    estimatedMinutes: z.coerce.number().min(0).default(0),
    order: z.number().default(0),
    topics: z.array(topicSchema).default([]),
    moduleTest: moduleTestSchema.optional().nullable(),
});

const finalTestSchema = z.object({
    title: z.string().min(2, 'Test title must be at least 2 characters'),
    totalQuestions: z.coerce.number().min(1).default(10),
    passingScore: z.coerce.number().min(0).max(100).default(60),
    timeLimitMinutes: z.coerce.number().min(1).default(30),
});

const courseSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters'),
    categoryId: z.string().min(1, 'Category is required'),
    shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    currency: z.string().default('INR'),
    status: z.nativeEnum(LmsCourseStatus),
    difficulty: z.nativeEnum(DifficultyLevel),
    isActive: z.boolean().default(true),
    certificateEnabled: z.boolean().default(false),
    passingPercentage: z.coerce.number().min(0).max(100).default(70),
    instructor: z.string().optional(),
    thumbnailUrl: z.string().url().optional().or(z.literal('')),
    previewVideoUrl: z.string().url().optional().or(z.literal('')),
    language: z.string().default('English'),
    tags: z.string().optional(), // Comma separated for UI
    modules: z.array(moduleSchema).default([]),
    finalTest: finalTestSchema.optional(),
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

    const handleFormSubmit = (values: CourseFormValues) => {
        // Transform tags back to array
        const tagsArray = values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        onSubmit({ ...values, tags: tagsArray as any });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
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
                                                <FormLabel>Short Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Brief summary (max 500 chars)"
                                                        className="resize-none h-20"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Detailed Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Full course description"
                                                        className="min-h-[120px]"
                                                        {...field}
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
                                                    <Input placeholder="https://..." {...field} />
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
                                                    <Input placeholder="https://youtube.com/..." {...field} />
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
                                                        <Input type="number" {...field} />
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
                                                        <Input type="number" {...field} />
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
                                                    <Input placeholder="John Doe" {...field} />
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
                                                    <Input placeholder="react, web, lms" {...field} />
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
                                                            <Input type="number" {...field} />
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
                                <CardContent>
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
                                                                        <Input type="number" {...field} className="h-8 text-sm" />
                                                                    </FormControl>
                                                                    <FormMessage />
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
                                                                    <Textarea placeholder="What will they learn?" {...field} className="min-h-[60px] text-sm resize-none" />
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
                                                                        { title: '', theoryContent: '', order: currentTopics.length + 1, estimatedMinutes: 10 }
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
                                                                                    <Input placeholder="Enter topic title" {...field} className="h-7 text-xs bg-card" />
                                                                                </FormControl>
                                                                                <FormMessage className="text-[10px]" />
                                                                            </FormItem>
                                                                        )}
                                                                    />

                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.videoUrl`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-1">
                                                                                    <FormLabel className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                                        <Video className="h-2 w-2" />
                                                                                        Video URL
                                                                                    </FormLabel>
                                                                                    <FormControl>
                                                                                        <Input placeholder="https://..." {...field} className="h-7 text-xs bg-card" />
                                                                                    </FormControl>
                                                                                </FormItem>
                                                                            )}
                                                                        />
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`modules.${moduleIndex}.topics.${topicIndex}.estimatedMinutes`}
                                                                            render={({ field }) => (
                                                                                <FormItem className="space-y-1">
                                                                                    <FormLabel className="text-[10px] text-muted-foreground">Duration (Min)</FormLabel>
                                                                                    <FormControl>
                                                                                        <Input type="number" {...field} className="h-7 text-xs bg-card" />
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
                                                                                    <Textarea placeholder="Topic body content..." {...field} className="min-h-[80px] text-xs resize-none bg-card" />
                                                                                </FormControl>
                                                                                <FormMessage className="text-[10px]" />
                                                                            </FormItem>
                                                                        )}
                                                                    />
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
        </Form>
    );
};
