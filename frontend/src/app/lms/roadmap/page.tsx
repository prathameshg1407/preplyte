// src/app/lms/roadmap/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Search,
    ExternalLink,
    RefreshCcw,
    BookOpen,
    GraduationCap,
    MapPin,
    Zap,
    Send,
    Loader2,
    Bot,
    User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { roadmapService, RoadmapQuestion, Roadmap, CourseRecommendation, RoadmapMessage } from '@/lib/api/services/roadmap.service';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function RoadmapPage() {
    const [step, setStep] = useState<'intro' | 'chat' | 'generating' | 'roadmap'>('intro');
    const [history, setHistory] = useState<RoadmapMessage[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<RoadmapQuestion | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
    const [courses, setCourses] = useState<CourseRecommendation[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isLoading]);

    // Auto-focus input when question changes
    useEffect(() => {
        if (currentQuestion?.inputType === 'text' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentQuestion]);

    /**
     * Start the wizard — fetch the first question from the backend.
     */
    const startChat = async () => {
        setStep('chat');
        setHistory([]);
        setIsLoading(true);
        setError(null);
        try {
            const firstQ = await roadmapService.getNextQuestion([]);
            setCurrentQuestion(firstQ);
            setHistory([{ role: 'assistant', content: firstQ.question }]);
        } catch (err) {
            console.error('Failed to start roadmap chat', err);
            setError('Failed to connect. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle when the user clicks one of the option buttons.
     */
    const handleOptionSelect = async (option: { label: string; value: string }) => {
        await sendUserMessage(option.label);
    };

    /**
     * Handle when the user submits text input.
     */
    const handleTextSubmit = async () => {
        if (!inputValue.trim()) return;
        const message = inputValue.trim();
        setInputValue('');
        await sendUserMessage(message);
    };

    /**
     * Core logic: send the user's message, add it to history, then ask AI for next step.
     */
    const sendUserMessage = async (message: string) => {
        const updatedHistory: RoadmapMessage[] = [
            ...history,
            { role: 'user', content: message }
        ];
        setHistory(updatedHistory);
        setIsLoading(true);
        setError(null);

        try {
            const nextQ = await roadmapService.getNextQuestion(updatedHistory);

            if (nextQ.isFinal) {
                // AI has enough info — generate the roadmap
                await generateRoadmap(updatedHistory);
            } else {
                // Show the next question
                setCurrentQuestion(nextQ);
                setHistory([...updatedHistory, { role: 'assistant', content: nextQ.question }]);
            }
        } catch (err) {
            console.error('Failed to get next question', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Generate the final roadmap from the full conversation history.
     */
    const generateRoadmap = async (conversationHistory: RoadmapMessage[]) => {
        setStep('generating');
        try {
            const result = await roadmapService.generateRoadmap(conversationHistory);
            setRoadmap(result.roadmap);
            setCourses(result.courses);
            setStep('roadmap');
        } catch (err) {
            console.error('Failed to generate roadmap', err);
            setError('Failed to generate your roadmap. Please try again.');
            setStep('chat');
        }
    };

    /**
     * Reset everything and start over.
     */
    const restart = () => {
        setStep('intro');
        setHistory([]);
        setCurrentQuestion(null);
        setRoadmap(null);
        setCourses([]);
        setInputValue('');
        setError(null);
    };

    // ─── RENDER ──────────────────────────────────────────────
    return (
        <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground overflow-x-hidden">
            {/* Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[120px]" />
            </div>

            <main className="container mx-auto max-w-5xl px-4 py-12">
                <AnimatePresence mode="wait">

                    {/* ── INTRO SCREEN ─────────── */}
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center text-center py-20"
                        >
                            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <MapPin className="h-10 w-10" />
                            </div>
                            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
                                Your AI <span className="text-primary">Learning Roadmap</span>
                            </h1>
                            <p className="mb-10 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                                Tell us your career goal and our AI will ask a few quick questions to understand
                                exactly what you need. Then we'll generate a personalized, step-by-step learning
                                path with matching courses from our platform.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" onClick={startChat} className="gap-2 h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                    <Sparkles className="h-5 w-5" />
                                    Get Started
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg rounded-full">
                                    <Link href="/lms">Browse Courses</Link>
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── CHAT / WIZARD SCREEN ─────────── */}
                    {step === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto w-full"
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Bot className="h-6 w-6 text-primary" />
                                        Roadmap Builder
                                    </h2>
                                    <p className="text-sm text-muted-foreground">Answer a few questions so we can build your path</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={restart} className="text-muted-foreground hover:text-foreground">
                                    <RefreshCcw className="h-4 w-4 mr-1" />
                                    Start Over
                                </Button>
                            </div>

                            <Card className="border-2 border-primary/10 overflow-hidden bg-card/50 backdrop-blur-sm">
                                {/* Chat Messages */}
                                <div
                                    ref={scrollRef}
                                    className="h-[420px] overflow-y-auto p-6 space-y-4 scroll-smooth"
                                >
                                    {history.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={cn(
                                                "flex gap-3",
                                                msg.role === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            {msg.role === 'assistant' && (
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                                    <Bot className="h-4 w-4 text-primary" />
                                                </div>
                                            )}
                                            <div className={cn(
                                                "max-w-[75%] rounded-2xl px-4 py-3 text-sm sm:text-base leading-relaxed",
                                                msg.role === 'assistant'
                                                    ? "bg-muted text-foreground rounded-tl-sm border border-border"
                                                    : "bg-primary text-primary-foreground rounded-tr-sm"
                                            )}>
                                                {msg.content}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center mt-1">
                                                    <User className="h-4 w-4 text-primary-foreground" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                    {/* Typing indicator */}
                                    {isLoading && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-1">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="bg-muted rounded-2xl px-4 py-3 rounded-tl-sm border border-border">
                                                <div className="flex gap-1.5 items-center">
                                                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="p-4 border-t border-border bg-muted/30">
                                    {error && (
                                        <div className="mb-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                            {error}
                                        </div>
                                    )}

                                    <AnimatePresence mode="wait">
                                        {/* Option buttons */}
                                        {!isLoading && currentQuestion?.options && currentQuestion.options.length > 0 && currentQuestion.inputType !== 'text' && (
                                            <motion.div
                                                key="options"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-3"
                                            >
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {currentQuestion.options.map((opt, i) => (
                                                        <Button
                                                            key={i}
                                                            variant="outline"
                                                            onClick={() => handleOptionSelect(opt)}
                                                            className="justify-start text-left h-auto py-3 px-4 rounded-xl border-primary/20 hover:border-primary hover:bg-primary/5 group transition-all"
                                                        >
                                                            <div className="flex flex-col items-start gap-0.5">
                                                                <span className="font-semibold text-sm">{opt.label}</span>
                                                                {opt.description && (
                                                                    <span className="text-xs text-muted-foreground group-hover:text-primary/70">{opt.description}</span>
                                                                )}
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                                {/* Always show text input below options so user can type custom answer */}
                                                <div className="flex gap-2 pt-1">
                                                    <Input
                                                        ref={inputRef}
                                                        placeholder="Or type your own answer..."
                                                        value={inputValue}
                                                        onChange={(e) => setInputValue(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                                                        className="rounded-xl border-border focus-visible:ring-primary h-10 text-sm"
                                                    />
                                                    <Button
                                                        onClick={handleTextSubmit}
                                                        size="icon"
                                                        className="rounded-xl h-10 w-10 shrink-0"
                                                        disabled={!inputValue.trim()}
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Text input only */}
                                        {!isLoading && currentQuestion?.inputType === 'text' && (
                                            <motion.div
                                                key="text-input"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex gap-2"
                                            >
                                                <Input
                                                    ref={inputRef}
                                                    placeholder="Type your answer here..."
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                                                    className="rounded-xl border-primary/20 focus-visible:ring-primary h-12"
                                                />
                                                <Button
                                                    onClick={handleTextSubmit}
                                                    className="rounded-xl h-12 px-5 gap-2"
                                                    disabled={!inputValue.trim()}
                                                >
                                                    <Send className="h-4 w-4" />
                                                    Send
                                                </Button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* ── GENERATING SCREEN ─────────── */}
                    {step === 'generating' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center py-32"
                        >
                            <div className="relative mb-8">
                                <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                </div>
                                <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full -z-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Building Your Roadmap...</h2>
                            <p className="text-muted-foreground max-w-md">
                                Our AI is analyzing your goals and creating a personalized learning path with matching courses.
                            </p>
                        </motion.div>
                    )}

                    {/* ── ROADMAP RESULT SCREEN ─────────── */}
                    {step === 'roadmap' && roadmap && (
                        <motion.div
                            key="roadmap"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-12"
                        >
                            {/* Header */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Roadmap Generated
                                    </div>
                                    <h1 className="text-3xl md:text-5xl font-bold">{roadmap.title}</h1>
                                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl">{roadmap.description}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button variant="outline" onClick={restart} className="gap-2 rounded-xl">
                                        <RefreshCcw className="h-4 w-4" />
                                        New Roadmap
                                    </Button>
                                    <Button asChild className="gap-2 rounded-xl">
                                        <Link href="/lms">
                                            <BookOpen className="h-4 w-4" />
                                            Explore Courses
                                        </Link>
                                    </Button>
                                </div>
                            </div>

                            {/* Main Grid */}
                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Timeline */}
                                <div className="lg:col-span-2">
                                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Learning Path
                                    </h2>
                                    <div className="relative pl-8 space-y-10">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted-foreground/20" />

                                        {roadmap.steps.map((s, idx) => (
                                            <motion.div
                                                key={s.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.08 }}
                                                className="relative"
                                            >
                                                {/* Dot */}
                                                <div className="absolute -left-[30px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background border-2 border-primary z-10 shadow-sm">
                                                    <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                                                </div>

                                                <Card className="border-border/50 hover:border-primary/20 transition-colors bg-card/30 backdrop-blur-sm">
                                                    <CardHeader className="pb-2">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="secondary" className="bg-primary/5 text-primary text-xs">Stage {idx + 1}</Badge>
                                                        </div>
                                                        <CardTitle className="text-lg">{s.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-3">
                                                        <CardDescription className="text-sm leading-relaxed">{s.description}</CardDescription>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {s.skills.map(skill => (
                                                                <Badge key={skill} variant="outline" className="bg-muted/50 border-border text-xs">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar — Matched Courses */}
                                <div className="space-y-6">
                                    <div className="sticky top-24">
                                        <div className="flex items-center gap-2 mb-6">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                <Zap className="h-5 w-5 text-primary" />
                                            </div>
                                            <h3 className="text-xl font-bold">Suggested Courses</h3>
                                        </div>

                                        <div className="space-y-4">
                                            {courses.length > 0 ? (
                                                courses.map((course, idx) => (
                                                    <motion.div
                                                        key={course.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 + idx * 0.08 }}
                                                    >
                                                        <Card className="overflow-hidden border-border/50 hover:border-primary/30 transition-all group">
                                                            <div className="aspect-video relative overflow-hidden bg-muted">
                                                                {course.thumbnailUrl ? (
                                                                    <img
                                                                        src={course.thumbnailUrl}
                                                                        alt={course.title}
                                                                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                                                    />
                                                                ) : (
                                                                    <div className="flex items-center justify-center h-full text-muted-foreground/20">
                                                                        <GraduationCap size={48} />
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-2 right-2">
                                                                    <Badge className={cn(
                                                                        "text-xs",
                                                                        course.source === 'platform' ? "bg-primary" : "bg-red-500"
                                                                    )}>
                                                                        {course.source === 'platform' ? 'Our Platform' : 'YouTube'}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <CardHeader className="p-4 pb-2">
                                                                <CardTitle className="text-sm line-clamp-2">{course.title}</CardTitle>
                                                            </CardHeader>
                                                            <CardContent className="p-4 pt-0">
                                                                <p className="text-xs text-muted-foreground line-clamp-2">{course.shortDescription}</p>
                                                            </CardContent>
                                                            <CardFooter className="p-4 pt-0">
                                                                <Button
                                                                    asChild
                                                                    size="sm"
                                                                    className="w-full gap-2 rounded-lg"
                                                                    variant={course.source === 'platform' ? 'default' : 'outline'}
                                                                >
                                                                    <a
                                                                        href={course.source === 'platform' ? `/lms/${course.slug}` : course.slug}
                                                                        target={course.source === 'external' ? '_blank' : undefined}
                                                                        rel={course.source === 'external' ? 'noopener noreferrer' : undefined}
                                                                    >
                                                                        {course.source === 'platform' ? 'Go to Course' : 'View on YouTube'}
                                                                        <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                </Button>
                                                            </CardFooter>
                                                        </Card>
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-border bg-muted/20">
                                                    <Search className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                                                    <p className="text-muted-foreground text-sm mb-3">No matching courses found on our platform yet.</p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        asChild
                                                    >
                                                        <a href={`https://www.google.com/search?q=${encodeURIComponent(roadmap.title + ' tutorials')}`} target="_blank" rel="noopener noreferrer">
                                                            Search resources online
                                                            <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Tip card */}
                                        <Card className="mt-6 bg-primary/5 border-primary/20">
                                            <CardContent className="p-4 space-y-2">
                                                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                                    <Sparkles className="h-4 w-4" />
                                                    Pro Tip
                                                </div>
                                                <p className="text-xs leading-relaxed text-muted-foreground">
                                                    Follow the stages in order — each one builds on the previous.
                                                    Start with the fundamentals before moving to advanced topics.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
