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
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import {
    Plus,
    Trash2,
    Video,
    FileText,
    Loader2,
    Link as LinkIcon
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

const topicSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    order: z.coerce.number().int().min(1),
    theoryContent: z.string().min(10, 'Theory content must be at least 10 characters'),
    videoUrl: z.string().url().optional().or(z.literal('')),
    videoDuration: z.coerce.number().min(0).optional(),
    estimatedMinutes: z.coerce.number().min(0).default(5),
    isActive: z.boolean().default(true),
    resources: z.array(z.object({
        name: z.string().min(1, 'Resource name is required'),
        url: z.string().url('Invalid URL'),
        type: z.enum(['pdf', 'link', 'file']),
    })).optional().default([]),
});

export type TopicFormValues = z.infer<typeof topicSchema>;

interface TopicFormProps {
    initialData?: Partial<TopicFormValues>;
    onSubmit: (data: TopicFormValues) => void;
    isLoading?: boolean;
}

export function TopicForm({ initialData, onSubmit, isLoading }: TopicFormProps) {
    const form = useForm<TopicFormValues>({
        resolver: zodResolver(topicSchema),
        defaultValues: {
            title: initialData?.title || '',
            description: initialData?.description || '',
            order: initialData?.order || 1,
            theoryContent: initialData?.theoryContent || '',
            videoUrl: initialData?.videoUrl || '',
            videoDuration: initialData?.videoDuration || 0,
            estimatedMinutes: initialData?.estimatedMinutes || 5,
            isActive: initialData?.isActive ?? true,
            resources: initialData?.resources || [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'resources',
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Topic Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Topic Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="What will they learn?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="theoryContent"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Theory Content (Rich Text / Markdown)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Explanatory text for the student..."
                                                    className="min-h-[300px] font-mono"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>Supports basic markdown formatting.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Summary Description (Optional)</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="A quick summary of this topic"
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Resources & Attachments</CardTitle>
                                    <CardDescription>Links, PDFs, or other helpful files.</CardDescription>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ name: '', url: '', type: 'link' })}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Resource
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {fields.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                                        No resources added yet.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-accent/20 relative">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>

                                                <div className="flex-1 space-y-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`resources.${index}.name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="Resource Name (e.g. Cheat Sheet)" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="flex-1 space-y-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`resources.${index}.url`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="URL" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="w-full md:w-[120px]">
                                                    <FormField
                                                        control={form.control}
                                                        name={`resources.${index}.type`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Type" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="link">Link</SelectItem>
                                                                        <SelectItem value="pdf">PDF</SelectItem>
                                                                        <SelectItem value="file">File</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Topic Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="order"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Order in Module</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimatedMinutes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estimated Mins</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isActive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <FormLabel>Active</FormLabel>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Video className="h-4 w-4" />
                                    Video Content
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="videoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Video URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://youtube.com/..." {...field} />
                                            </FormControl>
                                            <FormDescription>Vimeo, YouTube, or MP4 cloud link.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="videoDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (Seconds)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => window.history.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Save Changes' : 'Create Topic'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}