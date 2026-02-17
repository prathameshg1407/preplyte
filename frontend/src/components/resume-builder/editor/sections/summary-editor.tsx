'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Resume, Summary } from '@/types/resume-builder.types';
import { useResumeStore } from '@/lib/store/resume-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save, Sparkles, FileText } from 'lucide-react';

const summarySchema = z.object({
  content: z.string().max(2000, 'Summary must be less than 2000 characters'),
});

type SummaryFormData = z.infer<typeof summarySchema>;

interface SummaryEditorProps {
  resume: Resume;
  onSave: (data: Summary) => Promise<void>;
}

export function SummaryEditor({ resume, onSave }: SummaryEditorProps) {
  const { updateContent, isSaving } = useResumeStore();

  const form = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      content: resume.content.summary?.content || '',
    },
  });

  const watchContent = form.watch('content');
  const charCount = watchContent?.length || 0;

  const onSubmit = async (data: SummaryFormData) => {
    updateContent({ summary: data });
    await onSave(data);
  };

  const sampleSummaries = [
    "Recent Computer Science graduate with strong foundation in software development and problem-solving. Proficient in Java, Python, and web technologies. Eager to apply academic knowledge and contribute to innovative projects in a dynamic team environment.",
    "Motivated engineering graduate with hands-on experience in project development and internships. Strong analytical skills and passion for learning new technologies. Seeking to leverage technical skills and fresh perspective to drive meaningful solutions.",
    "Enthusiastic fresher with a degree in Information Technology and practical experience through academic projects. Skilled in programming, database management, and teamwork. Ready to contribute energy and dedication to a growth-oriented organization.",
    "Goal-oriented graduate with excellent communication and technical skills. Completed multiple projects in web development and data analysis during coursework. Looking to begin career in a challenging role that fosters professional growth and innovation.",
    "Ambitious Computer Science graduate with strong programming fundamentals and problem-solving abilities. Completed internship at tech startup, gaining real-world development experience. Passionate about creating efficient solutions and continuous learning.",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Professional Summary</h2>
        <p className="text-muted-foreground">
          Write a compelling summary of your professional background
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Summary
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a brief summary of your professional background, key skills, and career objectives..."
                        className="min-h-[200px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="flex justify-between">
                      <span>
                        Aim for 2-4 sentences that highlight your key strengths
                      </span>
                      <span className={charCount > 1800 ? 'text-destructive' : ''}>
                        {charCount}/2000
                      </span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tips & Examples */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Tips for a Great Summary (For Freshers)
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 mb-6">
                <li>• Start with your degree and field of study</li>
                <li>• Highlight 2-3 key technical skills or areas of interest</li>
                <li>• Mention relevant projects, internships, or certifications</li>
                <li>• Show enthusiasm and willingness to learn</li>
                <li>• Keep it concise - 2-3 sentences is ideal for freshers</li>
                <li>• Focus on potential and eagerness rather than years of experience</li>
              </ul>

              <h4 className="font-medium mb-3">Example Summaries for Freshers</h4>
              <div className="space-y-3">
                {sampleSummaries.map((sample, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted rounded-lg text-sm cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => form.setValue('content', sample)}
                  >
                    <p className="text-muted-foreground">{sample}</p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="p-0 h-auto mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        form.setValue('content', sample);
                      }}
                    >
                      Use this template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}