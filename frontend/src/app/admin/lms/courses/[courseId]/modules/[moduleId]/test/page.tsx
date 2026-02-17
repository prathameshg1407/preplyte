'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    useModule,
    useModuleTestsByModule,
    useAddModuleTest,
    useUpdateModuleTest
} from '@/lib/hooks/admin/use-lms-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TestQuestionsManager } from '@/components/admin/lms/test-questions-manager';
import { ArrowLeft, Save, Loader2, Plus, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ModuleTestPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const moduleId = params.moduleId as string;

    const { data: module, isLoading: moduleLoading } = useModule(moduleId);
    const { data: tests, isLoading: testsLoading, refetch } = useModuleTestsByModule(moduleId);
    const addTestMutation = useAddModuleTest();
    const updateTestMutation = useUpdateModuleTest();

    const test = tests && tests.length > 0 ? tests[0] : null;

    const [formData, setFormData] = useState<any>({
        title: '',
        instructions: '',
        totalQuestions: 10,
        passingScore: 70,
        timeLimitMinutes: 20,
        pointsPerQuestion: 1,
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
        } else if (module) {
            setFormData((prev: any) => ({ ...prev, title: `${module.title} Test` }));
        }
    }, [test, module]);

    const handleCreateTest = async () => {
        try {
            await addTestMutation.mutateAsync({
                moduleId,
                ...formData
            });
            toast.success('Test created successfully!');
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
            toast.success('Test settings updated!');
        } catch (error) {
            toast.error('Failed to update test');
        }
    };

    if (moduleLoading || testsLoading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/admin/lms/courses/${courseId}/modules/${moduleId}`}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Module Test Settings</h1>
                    <p className="text-muted-foreground">Manage assessment for module: {module?.title}</p>
                </div>
            </div>

            {!test ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Test</CardTitle>
                        <CardDescription>This module doesn't have a test yet. Setup the assessment properties below.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <TestPropertiesForm formData={formData} setFormData={setFormData} />
                        <Button className="w-full" onClick={handleCreateTest} disabled={addTestMutation.isPending}>
                            {addTestMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Test
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Test Configuration</CardTitle>
                                <CardDescription>Adjust timing, scores, and status.</CardDescription>
                            </div>
                            <Button onClick={handleUpdateTest} disabled={updateTestMutation.isPending}>
                                {updateTestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Settings
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <TestPropertiesForm formData={formData} setFormData={setFormData} />
                        </CardContent>
                    </Card>

                    <TestQuestionsManager
                        testId={test.id}
                        testType="module"
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
                    <Label htmlFor="test-title">Test Title</Label>
                    <Input
                        id="test-title"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="test-instructions">Instructions (Optional)</Label>
                    <Input
                        id="test-instructions"
                        value={formData.instructions}
                        onChange={(e) => handleChange('instructions', e.target.value)}
                    />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="test-active">Active & Visible</Label>
                    <Switch
                        id="test-active"
                        checked={formData.isActive}
                        onCheckedChange={(val) => handleChange('isActive', val)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="total-questions">Questions to Show</Label>
                    <Input
                        id="total-questions"
                        type="number"
                        value={formData.totalQuestions}
                        onChange={(e) => handleChange('totalQuestions', parseInt(e.target.value))}
                    />
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Info className="h-3 w-3" /> System will pick this many randomly.
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="time-limit">Time Limit (Mins)</Label>
                    <Input
                        id="time-limit"
                        type="number"
                        value={formData.timeLimitMinutes}
                        onChange={(e) => handleChange('timeLimitMinutes', parseInt(e.target.value))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="passing-score">Passing Score (%)</Label>
                    <Input
                        id="passing-score"
                        type="number"
                        value={formData.passingScore}
                        onChange={(e) => handleChange('passingScore', parseInt(e.target.value))}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="points-per">Points per Quest</Label>
                    <Input
                        id="points-per"
                        type="number"
                        value={formData.pointsPerQuestion}
                        onChange={(e) => handleChange('pointsPerQuestion', parseFloat(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}
