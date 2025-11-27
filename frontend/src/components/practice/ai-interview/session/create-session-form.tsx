// src/components/practice/ai-interview/session/create-session-form.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mic, Briefcase, Target, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ResumeSelector } from './resume-selector';
import { DifficultySelector } from './difficulty-selector';
import { useCreateSession } from '@/lib/hooks/use-interview';
import type { InterviewDifficulty } from '@/types/interview.types';

// =====================================================
// SCHEMA
// =====================================================

const createSessionSchema = z.object({
  resumeId: z.string().optional(),
  jobTitle: z.string().min(2, 'Job title must be at least 2 characters').max(100).optional(),
  companyName: z.string().max(100).optional(),
  difficulty: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD']).default('MID'),
  focusAreas: z.array(z.string()).max(5).default([]),
  targetQuestions: z.number().min(5).max(15).default(10),
});

type FormData = z.infer<typeof createSessionSchema>;

// =====================================================
// FOCUS AREAS
// =====================================================

const FOCUS_AREA_OPTIONS = [
  'Data Structures',
  'Algorithms',
  'System Design',
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Leadership',
  'Communication',
  'Problem Solving',
];

// =====================================================
// COMPONENT
// =====================================================

export function CreateSessionForm() {
  const { mutate: createSession, isPending } = useCreateSession();
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      jobTitle: 'Software Engineer',
      difficulty: 'MID',
      focusAreas: [],
      targetQuestions: 10,
    },
  });

  const handleSubmit = (data: FormData) => {
    createSession({
      ...data,
      focusAreas: selectedFocusAreas,
    });
  };

  const toggleFocusArea = (area: string) => {
    setSelectedFocusAreas((prev) => {
      if (prev.includes(area)) {
        return prev.filter((a) => a !== area);
      }
      if (prev.length >= 5) return prev;
      return [...prev, area];
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Mic className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Start AI Interview</CardTitle>
            <CardDescription>
              Configure your practice interview session
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Resume Selection */}
            <FormField
              control={form.control}
              name="resumeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume (Optional)</FormLabel>
                  <FormControl>
                    <ResumeSelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Select a resume for personalized questions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job Title */}
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Job Title
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Software Engineer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Google, Amazon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Difficulty */}
            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Difficulty Level
                  </FormLabel>
                  <FormControl>
                    <DifficultySelector
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Focus Areas */}
            <div className="space-y-3">
              <FormLabel>Focus Areas (Optional, max 5)</FormLabel>
              <div className="flex flex-wrap gap-2">
                {FOCUS_AREA_OPTIONS.map((area) => (
                  <Badge
                    key={area}
                    variant={selectedFocusAreas.includes(area) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => toggleFocusArea(area)}
                  >
                    {area}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFocusAreas.length}/5
              </p>
            </div>

            {/* Number of Questions */}
            <FormField
              control={form.control}
              name="targetQuestions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Number of Questions: {field.value}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      min={5}
                      max={15}
                      step={1}
                      className="py-4"
                    />
                  </FormControl>
                  <FormDescription>
                    Interview will have approximately {field.value} questions
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Interview
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}