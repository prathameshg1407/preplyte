/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Target,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '@/lib/api/axios-instance';
import { RESUME_BUILDER_ENDPOINTS } from '@/lib/api/endpoints';
import { useToast } from '@/components/ui/use-toast';
import { LottieLoader } from './lottie-loader';

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

export function ATSScoreChecker() {
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



  const analyzeResume = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setResult(null);
    setCurrentStatus(0); // Reset status

    try {
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      analyzeResume(file);
    }
  }, [jobRole, jobDescription]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'fair':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'poor':
        return 'text-orange-600 dark:text-orange-400';
      case 'missing':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">ATS Compatibility Checker</h2>
        <p className="text-muted-foreground">
          Upload your resume to get an instant ATS compatibility score powered by AI
        </p>
        
      </div>

      {/* Job Role and Description (Optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Job Details (Optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="e.g., Senior Software Engineer, Product Manager..."
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              disabled={isAnalyzing}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Specify the job role you are targeting
            </p>
          </div>
          <div>
            <Textarea
              placeholder="Paste the job description here for targeted keyword analysis..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[100px] resize-none"
              disabled={isAnalyzing}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Adding a job description helps identify missing keywords specific to the role
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isAnalyzing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} disabled={isAnalyzing} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop your resume file or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOC, and DOCX files (max 5MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
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
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                ATS Compatibility Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}/100
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={result.score >= 80 ? 'default' : result.score >= 60 ? 'secondary' : 'destructive'}>
                    {result.score >= 80 ? 'ATS Friendly' : result.score >= 60 ? 'Mostly Compatible' : 'Needs Work'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formatting: {result.formatting.score}/100
                  </p>
                </div>
              </div>
              <Progress value={result.score} className="h-2" />
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Strengths ({result.strengths.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.strengths.map((strength, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  Weaknesses ({result.weaknesses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      <span>{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex gap-2 text-sm p-2 rounded-lg bg-muted/50">
                    <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keywords Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Keywords Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Found Keywords ({result.keywordAnalysis.found.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordAnalysis.found.length > 0 ? (
                      result.keywordAnalysis.found.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs bg-green-100 dark:bg-green-900">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No keywords identified</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Missing Keywords ({result.keywordAnalysis.missing.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordAnalysis.missing.length > 0 ? (
                      result.keywordAnalysis.missing.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="text-xs border-red-200 dark:border-red-800">
                          {keyword}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">All important keywords present</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Analysis */}
          {result.sections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Section Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {result.sections.map((section, index) => (
                    <div key={index} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{section.name}</span>
                        {section.present ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className={`text-xs capitalize ${getQualityColor(section.quality)}`}>
                        {section.quality}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formatting Issues */}
          {result.formatting.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Formatting Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.formatting.issues.map((issue, index) => (
                    <div key={index} className="flex gap-2 text-sm p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setResult(null)}>
              <Upload className="h-4 w-4 mr-2" />
              Analyze Another Resume
            </Button>
          </div>

          {/* Timestamp */}
          <p className="text-center text-xs text-muted-foreground">
            Analyzed on {new Date(result.analyzedAt).toLocaleString()}
          </p>
        </motion.div>
      )}
    </div>
  );
}
