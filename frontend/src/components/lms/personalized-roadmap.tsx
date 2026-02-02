'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Circle,
  Clock,
  Star,
  Play,
  BookOpen,
  Code,
  Award,
  Target,
  Calendar,
  Download,
  Share,
  RefreshCw,
  ArrowRight,
  MapPin,
  Zap,
} from 'lucide-react';
import { GeneratedRoadmap, UserProfile, RoadmapStep } from '@/app/lms/roadmap/page';

interface PersonalizedRoadmapProps {
  roadmap: GeneratedRoadmap;
  userProfile: UserProfile;
  onRestart: () => void;
}

export function PersonalizedRoadmap({ roadmap, userProfile, onRestart }: PersonalizedRoadmapProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepProgress = () => {
    return (completedSteps.size / roadmap.steps.length) * 100;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCourseTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />;
      case 'project':
        return <Code className="h-4 w-4" />;
      case 'practice':
        return <Target className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getCourseTypeColor = (type: string) => {
    switch (type) {
      case 'course':
        return 'text-blue-600 dark:text-blue-400';
      case 'project':
        return 'text-green-600 dark:text-green-400';
      case 'practice':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Roadmap Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <Badge variant="secondary">Your Personalized Roadmap</Badge>
                </div>
                <h1 className="text-2xl font-bold">{roadmap.title}</h1>
                <p className="text-muted-foreground">{roadmap.description}</p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{roadmap.totalDuration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4" />
                    <span>{roadmap.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4" />
                    <span>{roadmap.steps.length} Steps</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button size="sm" className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Learning
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={onRestart}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedSteps.size} of {roadmap.steps.length} steps completed
                </span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
              
              {/* Milestones */}
              {roadmap.milestones.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Milestones</h4>
                  <div className="grid gap-3 md:grid-cols-3">
                    {roadmap.milestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={`p-3 rounded-lg border ${
                          completedSteps.size > milestone.stepIndex
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                            : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {completedSteps.size > milestone.stepIndex ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium text-sm">{milestone.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{milestone.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Roadmap Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Learning Path</h2>
        
        <div className="space-y-4">
          {roadmap.steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`transition-all ${
                completedSteps.has(step.id) 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'hover:shadow-md'
              }`}>
                <CardHeader 
                  className="cursor-pointer"
                  onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStepCompletion(step.id);
                        }}
                        className="flex-shrink-0"
                      >
                        {completedSteps.has(step.id) ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">
                            Step {index + 1}: {step.title}
                          </h3>
                          <Badge className={`text-xs ${getDifficultyColor(step.difficulty)}`}>
                            {step.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {step.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {step.courses.length} items
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <ArrowRight className={`h-4 w-4 transition-transform ${
                      expandedStep === step.id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </CardHeader>

                {expandedStep === step.id && (
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Skills */}
                      <div>
                        <h4 className="font-medium mb-2">Skills You'll Learn</h4>
                        <div className="flex flex-wrap gap-2">
                          {step.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Courses */}
                      <div>
                        <h4 className="font-medium mb-3">Learning Materials</h4>
                        <div className="space-y-2">
                          {step.courses.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`${getCourseTypeColor(course.type)}`}>
                                  {getCourseTypeIcon(course.type)}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{course.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {course.duration}
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {course.type}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prerequisites */}
                      {step.prerequisites && step.prerequisites.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Prerequisites</h4>
                          <div className="text-sm text-muted-foreground">
                            Complete the previous steps before starting this one.
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center gap-4"
      >
        <Button onClick={onRestart} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Create New Roadmap
        </Button>
        <Button>
          <Zap className="h-4 w-4 mr-2" />
          Start Your Journey
        </Button>
      </motion.div>
    </div>
  );
}