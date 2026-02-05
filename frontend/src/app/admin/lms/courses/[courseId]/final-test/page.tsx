'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    useCourse,
    useFinalTestsByCourse,
    useAddFinalTest,
    useUpdateFinalTest
} from '@/lib/hooks/admin/use-lms-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

import { TestQuestionsManager } from '@/components/admin/lms/test-questions-manager';
import { ArrowLeft, Save, Loader2, Info, Award } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function FinalTestPage() {
    const params = useParams();
    const courseId = params.courseId as string;

    const { data: course, isLoading: courseLoading } = useCourse(courseId);
    const { data: tests, isLoading: testsLoading, refetch } = useFinalTestsByCourse(courseId);
    const addTestMutation = useAddFinalTest();
    const updateTestMutation = useUpdateFinalTest();

    const test = tests && tests.length > 0 ? tests[0] : null;

    const [formData, setFormData] = useState<any>({
        title: '',
        instructions: '',
        totalQuestions: 20,
        passingScore: 70,
        timeLimitMinutes: 60,
        pointsPerQuestion: 5,
        isActive: true
    });

    useEffect(() => {
        if (test) {
            setFormData({
                title: test.title,
                instructions: test.instructions || '',
                totalQuestions: test.totalQuestions,
                passingScore: test.passingScore,
                timeLimitMinutes: test.timeLimitMinutes,
                pointsPerQuestion: test.pointsPerQuestion,
                isActive: test.isActive
            });
        } else if (course) {
            setFormData(prev => ({ ...prev, title: `${course.title} Final Examination` }));
        }
    }, [test, course]);

    const handleCreateTest = async () => {
        try {
            await addTestMutation.mutateAsync({
                courseId,
                ...formData
            });
            toast.success('Final test created successfully!');
            refetch();
        } catch (error) {
            toast.error('Failed to create test');
        }
    };

    const handleUpdateTest = async () => {
        if (!test) return;
        try {
            await updateTestMutation.mutateAsync({
                id: test.id,
                data: formData
            });
            toast.success('Final test settings updated!');
        } catch (error) {
            toast.error('Failed to update test');
        }
    };

    if (courseLoading || testsLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/lms/courses/${courseId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-500/10 p-2 rounded">
                        <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Course Final Examination</h1>
                        <p className="text-muted-foreground">Manage the final certification test for: {course?.title}</p>
                    </div>
                </div>
            </div>

            {!test ? (
                <Card border-primary>
                    <CardHeader>
                        <CardTitle>Configure Final Test</CardTitle>
                        <CardDescription>Setup the final assessment required for course completion and certification.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <TestPropertiesForm formData={formData} setFormData={setFormData} />
                        <Button className="w-full" onClick={handleCreateTest} disabled={addTestMutation.isPending}>
                            {addTestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Initialize Final Test
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Examination Configuration</CardTitle>
                                <CardDescription>Adjust rules and visibility for the final test.</CardDescription>
                            </div>
                            <Button onClick={handleUpdateTest} disabled={updateTestMutation.isPending}>
                                {updateTestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Examination Rules
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <TestPropertiesForm formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <TestQuestionsManager
                        testId={test.id}
                        testType="final"
                        questions={test.questions || []}
                    />
                </div>
            )}
        </div>
    );
}

function TestPropertiesForm({ formData, setFormData }: any) {
    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="exam-title">Examination Title</Label>
                    <Input
                        id="exam-title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="exam-instructions">Instructions for Students</Label>
                    <Textarea
                        id="exam-instructions"
                        value={formData.instructions}
                        className="h-20"
                        onChange={(e) => handleChange('instructions', e.target.value)}
                        placeholder="Important rules for the final exam..."
                    />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <Label htmlFor="exam-active">Test Availability</Label>
                        <p className="text-xs text-muted-foreground">Toggle visibility for this exam.</p>
                    </div>
                    <Switch
                        id="exam-active"
                        checked={formData.isActive}
                        onCheckedChange={(val) => handleChange('isActive', val)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="exam-total">Questions Count</Label>
                    <Input
                        id="exam-total"
                        type="number"
                        value={formData.totalQuestions}
                        onChange={(e) => handleChange('totalQuestions', parseInt(e.target.value))}
                    />
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" /> system picks this many randomly.
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="exam-time">Time Limit (Mins)</Label>
                    <Input
                        id="exam-time"
                        type="number"
                        value={formData.timeLimitMinutes}
                        onChange={(e) => handleChange('timeLimitMinutes', parseInt(e.target.value))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="exam-pass">Passing Score (%)</Label>
                    <Input
                        id="exam-pass"
                        type="number"
                        value={formData.passingScore}
                        onChange={(e) => handleChange('passingScore', parseInt(e.target.value))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="exam-points">Points per Quest</Label>
                    <Input
                        id="exam-points"
                        type="number"
                        value={formData.pointsPerQuestion}
                        onChange={(e) => handleChange('pointsPerQuestion', parseFloat(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}
