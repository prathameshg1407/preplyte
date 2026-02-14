'use client';

import { useState } from 'react';
import { Resume } from '@/types/resume-builder.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Award,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { apiClient } from '@/lib/api/axios-instance';
import { RESUME_BUILDER_ENDPOINTS } from '@/lib/api/endpoints';
import { useToast } from '@/components/ui/use-toast';
import { LottieLoader } from '../lottie-loader';

interface ATSAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywordAnalysis: {
    found: string[];
    missing: string[];
  };
  formatting: {
    score: number;
    issues: string[];
  };
  sections: Array<{
    name: string;
    present: boolean;
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  }>;
  analyzedAt: string;
}

interface ATSCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: Resume;
}

export function ATSCheckDialog({ open, onOpenChange, resume }: ATSCheckDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [currentStatus, setCurrentStatus] = useState(0);
  const { toast } = useToast();

  // Status messages that rotate during analysis
  const statusMessages = [
    'Parsing your resume...',
    'Checking keywords...',
    'Analyzing formatting...',
    'Evaluating ATS compatibility...',
    'Reviewing section structure...',
    'Assessing content quality...',
    'Comparing with job requirements...',
    'Generating recommendations...',
  ];

  // Handle status change from Lottie animation
  const handleStatusChange = () => {
    setCurrentStatus((prev) => (prev + 1) % statusMessages.length);
  };

  const handleCheckATS = async () => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setResult(null);
    setCurrentStatus(0); // Reset status

    try {
      // Get the resume preview HTML
      const resumePreview = document.querySelector('[data-resume-preview]');
      if (!resumePreview) {
        throw new Error('Resume preview not found. Please make sure your resume is loaded.');
      }

      // Create HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>${resume.title}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              h1, h2, h3 { margin-bottom: 10px; }
              p { margin-bottom: 8px; }
              ul { margin-left: 20px; margin-bottom: 8px; }
            </style>
          </head>
          <body>${resumePreview.innerHTML}</body>
        </html>
      `;

      // Create a blob and file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const file = new File([blob], `${resume.title}.html`, { type: 'text/html' });

      const formData = new FormData();
      formData.append('resume', file);
      
      if (jobRole.trim()) {
        formData.append('jobRole', jobRole.trim());
      }
      
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
      }

      const response = await apiClient.post(
        RESUME_BUILDER_ENDPOINTS.ATS_CHECK,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        // Mark analysis as complete to trigger checkmark animation
        setAnalysisComplete(true);
        
        // Wait for checkmark animation to play (about 2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setResult(response.data.data);
        toast({
          title: 'Analysis Complete',
          description: 'Your resume has been analyzed successfully.',
        });
      }
    } catch (error: any) {
      console.error('ATS analysis error:', error);
      
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to analyze resume. Please try again.';
      
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisComplete(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleReset = () => {
    setResult(null);
    setAnalysisComplete(false);
    setJobRole('');
    setJobDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Check ATS Score
          </DialogTitle>
          <DialogDescription>
            Analyze your resume for ATS compatibility and get actionable feedback
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Job Details Input */}
          {!result && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Job Role (Optional)</label>
                <Input
                  placeholder="e.g., Senior Software Engineer, Product Manager..."
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  disabled={isAnalyzing}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Job Description (Optional)</label>
                <Textarea
                  placeholder="Paste the job description here for targeted keyword analysis..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="min-h-[100px] resize-none mt-1"
                  disabled={isAnalyzing}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Adding job details helps identify missing keywords specific to the role
                </p>
              </div>
              <Button 
                onClick={handleCheckATS} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Analysis Loading */}
          {isAnalyzing && (
            <div className="text-center space-y-4 py-8">
              {/* Lottie Animation */}
              <LottieLoader 
                size={128} 
                isComplete={analysisComplete}
                onStatusChange={handleStatusChange}
              />
              <div>
                <h3 className="font-semibold">
                  {analysisComplete ? 'Analysis Complete!' : 'Analyzing your resume...'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {analysisComplete ? 'Preparing your results...' : statusMessages[currentStatus]}
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !isAnalyzing && (
            <div className="space-y-4">
              {/* Overall Score */}
              <div className="p-4 rounded-lg border bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}/100
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : 'Needs Improvement'}
                    </p>
                  </div>
                  <Badge variant={result.score >= 80 ? 'default' : result.score >= 60 ? 'secondary' : 'destructive'}>
                    {result.score >= 80 ? 'ATS Friendly' : result.score >= 60 ? 'Mostly Compatible' : 'Needs Work'}
                  </Badge>
                </div>
                <Progress value={result.score} className="h-2" />
              </div>

              {/* Strengths */}
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Strengths ({result.strengths.length})
                </h4>
                <div className="space-y-1">
                  {result.strengths.slice(0, 3).map((strength, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Weaknesses ({result.weaknesses.length})
                </h4>
                <div className="space-y-1">
                  {result.weaknesses.slice(0, 3).map((weakness, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <span>{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Suggestions */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Top Suggestions
                </h4>
                <div className="space-y-1">
                  {result.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="flex gap-2 text-sm p-2 rounded-lg bg-muted/50">
                      <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  className="flex-1"
                >
                  Check Again
                </Button>
                <Button 
                  onClick={() => {
                    onOpenChange(false);
                    // Navigate to full ATS checker for detailed view
                    window.open('/resume-builder?tab=ats-checker', '_blank');
                  }}
                  className="flex-1"
                >
                  View Full Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
