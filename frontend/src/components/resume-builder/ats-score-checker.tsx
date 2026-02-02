'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Target,
  Zap,
  Download,
  RefreshCw,
  Eye,
  Lightbulb,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface ATSScore {
  overall: number;
  breakdown: {
    formatting: number;
    keywords: number;
    sections: number;
    readability: number;
  };
  issues: Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    section?: string;
  }>;
  suggestions: string[];
  keywords: {
    found: string[];
    missing: string[];
    suggested: string[];
  };
}

const SAMPLE_SCORE: ATSScore = {
  overall: 78,
  breakdown: {
    formatting: 85,
    keywords: 70,
    sections: 80,
    readability: 75,
  },
  issues: [
    {
      type: 'error',
      message: 'Missing contact information section',
      section: 'Header',
    },
    {
      type: 'warning',
      message: 'Skills section could be more detailed',
      section: 'Skills',
    },
    {
      type: 'suggestion',
      message: 'Consider adding more action verbs in experience section',
      section: 'Experience',
    },
  ],
  suggestions: [
    'Add more industry-specific keywords',
    'Use bullet points for better readability',
    'Include quantifiable achievements',
    'Ensure consistent formatting throughout',
  ],
  keywords: {
    found: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
    missing: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
    suggested: ['Next.js', 'GraphQL', 'PostgreSQL', 'Redis'],
  },
};

export function ATSScoreChecker() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<ATSScore | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsAnalyzing(true);
      // Simulate file processing
      setTimeout(() => {
        setScore(SAMPLE_SCORE);
        setIsAnalyzing(false);
      }, 3000);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const analyzeText = () => {
    if (!resumeText.trim()) return;
    
    setIsAnalyzing(true);
    setTimeout(() => {
      setScore(SAMPLE_SCORE);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">ATS Compatibility Checker</h2>
        <p className="text-muted-foreground">
          Upload your resume or paste the content to get an instant ATS compatibility score
        </p>
      </div>

      {/* Input Methods */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="text">Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your resume file or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, DOC, and DOCX files (max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Textarea
                placeholder="Paste your resume content here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <Button 
                onClick={analyzeText} 
                disabled={!resumeText.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze Resume
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="font-semibold">Analyzing your resume...</h3>
                  <p className="text-sm text-muted-foreground">
                    This may take a few moments
                  </p>
                </div>
                <Progress value={66} className="w-full max-w-xs mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Results */}
      {score && !isAnalyzing && (
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
                  <div className={`text-4xl font-bold ${getScoreColor(score.overall)}`}>
                    {score.overall}/100
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {score.overall >= 80 ? 'Excellent' : score.overall >= 60 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={score.overall >= 80 ? 'default' : score.overall >= 60 ? 'secondary' : 'destructive'}>
                    {score.overall >= 80 ? 'ATS Friendly' : score.overall >= 60 ? 'Mostly Compatible' : 'Needs Work'}
                  </Badge>
                </div>
              </div>
              <Progress value={score.overall} className="h-2" />
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(score.breakdown).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{key}</span>
                      <span className={getScoreColor(value)}>{value}%</span>
                    </div>
                    <Progress value={value} className="h-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Issues and Suggestions */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Issues Found
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {score.issues.map((issue, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{issue.message}</p>
                        {issue.section && (
                          <p className="text-xs text-muted-foreground">
                            Section: {issue.section}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

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
                  {score.suggestions.map((suggestion, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Keywords Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Keywords Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                    Found Keywords ({score.keywords.found.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {score.keywords.found.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Missing Keywords ({score.keywords.missing.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {score.keywords.missing.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
                    Suggested Keywords ({score.keywords.suggested.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {score.keywords.suggested.map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-xs border-blue-200">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => setScore(null)}>
              <Upload className="h-4 w-4 mr-2" />
              Analyze Another Resume
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}