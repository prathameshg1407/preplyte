// src/app/lms/roadmap/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Clock, CheckCircle2, Circle, PlayCircle, Share2,
    Trash2, ArrowLeft, Loader2, BookOpen, ExternalLink,
    Sparkles, Zap, Copy, Check, Link2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    roadmapService, SavedRoadmapDetail, SavedRoadmapStepDetail,
    CourseRecommendation
} from '@/lib/api/services/roadmap.service';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

export default function SavedRoadmapPage() {
    const router = useRouter();
    const params = useParams();
    const roadmapId = params.id as string;

    const [roadmap, setRoadmap] = useState<SavedRoadmapDetail | null>(null);
    const [stepCourses, setStepCourses] = useState<Record<string, CourseRecommendation[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [updatingStep, setUpdatingStep] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRoadmap = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await roadmapService.getRoadmap(roadmapId);
            setRoadmap(data);

            // Load courses for each step based on saved skills
            if (data.steps.length > 0) {
                try {
                    const stepsPayload = data.steps.map(s => ({ id: s.id, skills: s.skills }));
                    const results = await roadmapService.searchCoursesForSteps(stepsPayload);
                    const coursesMap: Record<string, CourseRecommendation[]> = {};
                    results.forEach(sc => {
                        coursesMap[sc.stepId] = sc.courses;
                    });
                    setStepCourses(coursesMap);
                } catch (err) {
                    console.error('Failed to load step courses', err);
                }
            }
        } catch (err) {
            console.error('Failed to load roadmap', err);
            setError('Roadmap not found');
        } finally {
            setIsLoading(false);
        }
    }, [roadmapId]);

    useEffect(() => {
        loadRoadmap();
    }, [loadRoadmap]);

    const cycleStepStatus = async (step: SavedRoadmapStepDetail) => {
        if (!roadmap) return;
        const nextStatus: Record<string, 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'> = {
            'NOT_STARTED': 'IN_PROGRESS',
            'IN_PROGRESS': 'COMPLETED',
            'COMPLETED': 'NOT_STARTED'
        };
        const newStatus = nextStatus[step.status];
        setUpdatingStep(step.id);
        try {
            await roadmapService.updateStepStatus(roadmapId, step.id, newStatus);
            setRoadmap(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    steps: prev.steps.map(s =>
                        s.id === step.id
                            ? { ...s, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null }
                            : s
                    )
                };
            });
        } catch (err) {
            console.error('Failed to update step', err);
        } finally {
            setUpdatingStep(null);
        }
    };

    const handleShare = async () => {
        if (!roadmap) return;

        if (roadmap.shareToken) {
            const url = `${window.location.origin}/lms/roadmap/shared/${roadmap.shareToken}`;
            setShareUrl(url);
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
        }

        setIsSharing(true);
        try {
            const result = await roadmapService.shareRoadmap(roadmapId);
            const url = `${window.location.origin}/lms/roadmap/shared/${result.shareToken}`;
            setShareUrl(url);
            setRoadmap(prev => prev ? { ...prev, shareToken: result.shareToken } : prev);
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to share', err);
        } finally {
            setIsSharing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this roadmap? This cannot be undone.')) return;
        setIsDeleting(true);
        try {
            await roadmapService.deleteRoadmap(roadmapId);
            router.push('/lms/roadmap/dashboard');
        } catch (err) {
            console.error('Failed to delete', err);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    if (error || !roadmap) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">{error || 'Roadmap not found'}</p>
                <Button asChild variant="outline"><Link href="/lms/roadmap/dashboard">Back to Dashboard</Link></Button>
            </div>
        );
    }

    const completedSteps = roadmap.steps.filter(s => s.status === 'COMPLETED').length;
    const progress = roadmap.steps.length > 0 ? Math.round((completedSteps / roadmap.steps.length) * 100) : 0;

    const statusIcon = (status: string) => {
        if (status === 'COMPLETED') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
        if (status === 'IN_PROGRESS') return <PlayCircle className="h-5 w-5 text-primary" />;
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    };

    const statusLabel = (status: string) => {
        if (status === 'COMPLETED') return 'Completed';
        if (status === 'IN_PROGRESS') return 'In Progress';
        return 'Not Started';
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[120px]" />
            </div>

            <main className="container mx-auto max-w-4xl px-4 py-12">
                {/* Back */}
                <Button variant="ghost" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" asChild>
                    <Link href="/lms/roadmap/dashboard"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
                </Button>

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-3xl font-bold">{roadmap.title}</h1>
                        <p className="text-muted-foreground mt-1">{roadmap.description}</p>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                            {roadmap.totalDuration && (
                                <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {roadmap.totalDuration}</Badge>
                            )}
                            <Badge variant="secondary" className={cn(progress === 100 ? "bg-green-500/10 text-green-600" : "")}>
                                {completedSteps}/{roadmap.steps.length} steps
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="outline" onClick={handleShare} disabled={isSharing} className="gap-2 rounded-xl">
                            {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : copied ? <Check className="h-4 w-4 text-green-500" /> : <Share2 className="h-4 w-4" />}
                            {copied ? 'Link Copied!' : 'Share'}
                        </Button>
                        <Button variant="outline" onClick={handleDelete} disabled={isDeleting} className="gap-2 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-500/5">
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card className="mb-8 border-primary/10">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Overall Progress</span>
                            <span className={cn("font-bold", progress === 100 ? "text-green-500" : "")}>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2.5" />
                        <p className="text-xs text-muted-foreground">
                            {progress === 100
                                ? "🎉 Congratulations! You've completed this roadmap!"
                                : `${roadmap.steps.length - completedSteps} steps remaining. Click a step to toggle its status.`
                            }
                        </p>
                    </CardContent>
                </Card>

                {shareUrl && (
                    <Card className="mb-6 bg-primary/5 border-primary/20">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Link2 className="h-5 w-5 text-primary shrink-0" />
                            <code className="text-xs flex-1 truncate bg-background/50 p-2 rounded">{shareUrl}</code>
                            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Steps Timeline */}
                <div className="relative pl-8 space-y-6">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted-foreground/20" />

                    {roadmap.steps.map((s, idx) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative"
                        >
                            {/* Dot */}
                            <button
                                onClick={() => cycleStepStatus(s)}
                                disabled={updatingStep === s.id}
                                className="absolute -left-[30px] top-4 z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-transform hover:scale-110"
                            >
                                {updatingStep === s.id ? (
                                    <div className="h-6 w-6 flex items-center justify-center"><Loader2 className="h-5 w-5 text-primary animate-spin" /></div>
                                ) : (
                                    statusIcon(s.status)
                                )}
                            </button>

                            <Card className={cn(
                                "transition-all",
                                s.status === 'COMPLETED' && "border-green-500/20 bg-green-500/5",
                                s.status === 'IN_PROGRESS' && "border-primary/30 bg-primary/5",
                                s.status === 'NOT_STARTED' && "border-border/50"
                            )}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className="text-xs">Stage {s.stepOrder}</Badge>
                                            {s.duration && (
                                                <Badge variant="outline" className="text-xs gap-1">
                                                    <Clock className="h-3 w-3" /> {s.duration}
                                                </Badge>
                                            )}
                                        </div>
                                        <Badge variant={s.status === 'COMPLETED' ? 'default' : 'outline'}
                                            className={cn("text-xs cursor-pointer select-none", s.status === 'COMPLETED' && "bg-green-500 hover:bg-green-600", s.status === 'IN_PROGRESS' && "text-primary border-primary")}
                                            onClick={() => cycleStepStatus(s)}
                                        >
                                            {statusLabel(s.status)}
                                        </Badge>
                                    </div>
                                    <CardTitle className={cn("text-lg", s.status === 'COMPLETED' && "line-through opacity-70")}>
                                        {s.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <CardDescription className="text-sm leading-relaxed">{s.description}</CardDescription>
                                    <div className="flex flex-wrap gap-1.5">
                                        {s.skills.map(skill => (
                                            <Badge key={skill} variant="outline" className="bg-muted/50 border-border text-xs">{skill}</Badge>
                                        ))}
                                    </div>
                                    {/* Inline courses */}
                                    {(stepCourses[s.id] || []).length > 0 && (
                                        <div className="pt-3 border-t border-border/50">
                                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                                <Zap className="h-3 w-3" /> Recommended Resources
                                            </p>
                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {(stepCourses[s.id] || []).slice(0, 4).map(course => (
                                                    <a
                                                        key={course.id}
                                                        href={course.source === 'platform' ? `/lms/${course.slug}` : course.slug}
                                                        target={course.source === 'external' ? '_blank' : undefined}
                                                        rel={course.source === 'external' ? 'noopener noreferrer' : undefined}
                                                        className="flex items-center gap-2 p-2 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group text-sm"
                                                    >
                                                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                                            {course.source === 'platform' ? <BookOpen className="h-4 w-4 text-primary" /> : <ExternalLink className="h-4 w-4 text-red-500" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-xs truncate group-hover:text-primary">{course.title}</p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                {course.source === 'platform' ? 'Our Platform' : 'YouTube'}
                                                            </p>
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Completion card */}
                {progress === 100 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
                        <Card className="bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/20">
                            <CardContent className="p-6 text-center">
                                <div className="text-4xl mb-3">🎉</div>
                                <h3 className="text-xl font-bold mb-2">Roadmap Completed!</h3>
                                <p className="text-muted-foreground mb-4">Amazing work! You&apos;ve completed all steps in this roadmap.</p>
                                <Button asChild className="gap-2 rounded-xl">
                                    <Link href="/lms/roadmap"><Sparkles className="h-4 w-4" /> Create Another Roadmap</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
