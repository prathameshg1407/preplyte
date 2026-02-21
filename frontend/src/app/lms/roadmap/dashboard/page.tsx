// src/app/lms/roadmap/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Sparkles, Trash2, ArrowRight, Clock,
    Loader2, Plus, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { roadmapService, SavedRoadmapSummary } from '@/lib/api/services/roadmap.service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoadmapDashboardPage() {
    const router = useRouter();
    const [roadmaps, setRoadmaps] = useState<SavedRoadmapSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        loadRoadmaps();
    }, []);

    const loadRoadmaps = async () => {
        setIsLoading(true);
        try {
            const data = await roadmapService.listRoadmaps();
            setRoadmaps(data);
        } catch (err) {
            console.error('Failed to load roadmaps', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this roadmap?')) return;
        setDeletingId(id);
        try {
            await roadmapService.deleteRoadmap(id);
            setRoadmaps(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to delete roadmap', err);
        } finally {
            setDeletingId(null);
        }
    };

    const getProgressColor = (progress: number) => {
        if (progress === 100) return 'text-green-500';
        if (progress > 50) return 'text-primary';
        if (progress > 0) return 'text-amber-500';
        return 'text-muted-foreground';
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[120px]" />
            </div>

            <main className="container mx-auto max-w-4xl px-4 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                            </div>
                            My Roadmaps
                        </h1>
                        <p className="text-muted-foreground mt-1">Track your learning progress across all roadmaps</p>
                    </div>
                    <Button asChild className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                        <Link href="/lms/roadmap">
                            <Plus className="h-4 w-4" /> New Roadmap
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                ) : roadmaps.length === 0 ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-20">
                        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No roadmaps yet</h2>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Create your first AI-powered learning roadmap to get started.
                        </p>
                        <Button asChild className="gap-2 rounded-xl">
                            <Link href="/lms/roadmap">
                                <Sparkles className="h-4 w-4" /> Create Your First Roadmap
                            </Link>
                        </Button>
                    </motion.div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AnimatePresence>
                            {roadmaps.map((rm, idx) => (
                                <motion.div
                                    key={rm.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card
                                        className="cursor-pointer hover:border-primary/30 transition-all group relative overflow-hidden"
                                        onClick={() => router.push(`/lms/roadmap/${rm.id}`)}
                                    >
                                        {/* Progress strip at top */}
                                        <div className="h-1 bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all"
                                                style={{ width: `${rm.progress}%` }}
                                            />
                                        </div>

                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0 pr-4">
                                                    <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                                                        {rm.title}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs mt-1 line-clamp-2">
                                                        {rm.description}
                                                    </CardDescription>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={(e) => handleDelete(rm.id, e)}
                                                    disabled={deletingId === rm.id}
                                                >
                                                    {deletingId === rm.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className={getProgressColor(rm.progress)}>
                                                    {rm.completedSteps}/{rm.totalSteps} steps completed
                                                </span>
                                                <span className="font-semibold">{rm.progress}%</span>
                                            </div>
                                            <Progress value={rm.progress} className="h-1.5" />

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    {rm.totalDuration && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> {rm.totalDuration}
                                                        </span>
                                                    )}
                                                    <span>{new Date(rm.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}
