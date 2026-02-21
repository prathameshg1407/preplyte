// src/app/lms/roadmap/shared/[token]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Clock, CheckCircle2, Circle, PlayCircle,
    Loader2, Sparkles, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { roadmapService, SavedRoadmapDetail } from '@/lib/api/services/roadmap.service';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SharedRoadmapPage() {
    const params = useParams();
    const token = params.token as string;

    const [roadmap, setRoadmap] = useState<(SavedRoadmapDetail & { userName?: string }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRoadmap = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await roadmapService.getSharedRoadmap(token);
            setRoadmap(data);
        } catch (err) {
            console.error('Failed to load shared roadmap', err);
            setError('This shared roadmap could not be found.');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadRoadmap();
    }, [loadRoadmap]);

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
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{error || 'Roadmap not found'}</p>
                <Button asChild className="gap-2 rounded-xl">
                    <Link href="/lms/roadmap"><Sparkles className="h-4 w-4" /> Create Your Own Roadmap</Link>
                </Button>
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

    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[120px]" />
            </div>

            <main className="container mx-auto max-w-4xl px-4 py-12">
                {/* Banner */}
                <Card className="mb-8 bg-gradient-to-r from-primary/5 to-violet-500/5 border-primary/20">
                    <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">
                                    Shared Roadmap{roadmap.userName ? ` by ${roadmap.userName}` : ''}
                                </p>
                                <p className="text-xs text-muted-foreground">This is a read-only view of a learning roadmap</p>
                            </div>
                        </div>
                        <Button asChild className="gap-2 rounded-xl shrink-0">
                            <Link href="/lms/roadmap">
                                <Sparkles className="h-4 w-4" /> Create Your Own
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">{roadmap.title}</h1>
                    <p className="text-muted-foreground mt-1">{roadmap.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        {roadmap.totalDuration && (
                            <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {roadmap.totalDuration}</Badge>
                        )}
                        <Badge variant="secondary">
                            {completedSteps}/{roadmap.steps.length} steps completed
                        </Badge>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card className="mb-8 border-primary/10">
                    <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Progress</span>
                            <span className="font-bold">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </CardContent>
                </Card>

                {/* Steps */}
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
                            <div className="absolute -left-[30px] top-4 z-10">
                                {statusIcon(s.status)}
                            </div>

                            <Card className={cn(
                                "border-border/50",
                                s.status === 'COMPLETED' && "border-green-500/20 bg-green-500/5",
                                s.status === 'IN_PROGRESS' && "border-primary/30 bg-primary/5"
                            )}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="secondary" className="text-xs">Stage {s.stepOrder}</Badge>
                                        {s.duration && (
                                            <Badge variant="outline" className="text-xs gap-1">
                                                <Clock className="h-3 w-3" /> {s.duration}
                                            </Badge>
                                        )}
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
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* CTA at bottom */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-6 text-center">
                            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                            <h3 className="text-lg font-bold mb-1">Want your own roadmap?</h3>
                            <p className="text-sm text-muted-foreground mb-4">Our AI will create a personalized learning path just for you.</p>
                            <Button asChild className="gap-2 rounded-xl">
                                <Link href="/lms/roadmap">
                                    Create Your Roadmap <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
