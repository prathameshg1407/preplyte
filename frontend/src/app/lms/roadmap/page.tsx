'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  BookOpen,
  Award,
  MapPin,
  Calendar,
  Play,
} from 'lucide-react';
import { RoadmapAssessment } from '@/components/lms/roadmap-assessment';
import { PersonalizedRoadmap } from '@/components/lms/personalized-roadmap';

export interface UserProfile {
  interests: string[];
  currentLevel: string;
  goals: string[];
  timeCommitment: string;
  preferredLearningStyle: string;
  experience: Record<string, string>;
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  courses: Array<{
    id: string;
    title: string;
    duration: string;
    type: 'course' | 'project' | 'practice';
    completed?: boolean;
  }>;
  skills: string[];
  prerequisites?: string[];
  completed?: boolean;
}

export interface GeneratedRoadmap {
  title: string;
  description: string;
  totalDuration: string;
  difficulty: string;
  steps: RoadmapStep[];
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    stepIndex: number;
  }>;
}

const ROADMAP_STATS = [
  {
    title: 'Success Rate',
    value: '94%',
    description: 'Students complete roadmaps',
    icon: Target,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Avg. Time to Goal',
    value: '6 months',
    description: 'From start to job-ready',
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Personalized Paths',
    value: '500+',
    description: 'Unique roadmaps created',
    icon: MapPin,
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Industry Alignment',
    value: '98%',
    description: 'Match with job requirements',
    icon: TrendingUp,
    color: 'text-orange-600 dark:text-orange-400',
  },
];

export default function RoadmapPage() {
  const [currentStep, setCurrentStep] = useState<'assessment' | 'roadmap'>('assessment');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [generatedRoadmap, setGeneratedRoadmap] = useState<GeneratedRoadmap | null>(null);

  const handleAssessmentComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    // Generate roadmap based on profile
    const roadmap = generateRoadmap(profile);
    setGeneratedRoadmap(roadmap);
    setCurrentStep('roadmap');
  };

  const generateRoadmap = (profile: UserProfile): GeneratedRoadmap => {
    // This would typically call an API to generate a personalized roadmap
    // For now, we'll create a sample roadmap based on the profile
    
    const isWebDev = profile.interests.includes('Web Development');
    const isDataScience = profile.interests.includes('Data Science');
    const isMobile = profile.interests.includes('Mobile Development');
    
    if (isWebDev) {
      return {
        title: 'Full-Stack Web Developer Roadmap',
        description: 'A comprehensive path to become a job-ready full-stack web developer',
        totalDuration: '6-8 months',
        difficulty: profile.currentLevel === 'Beginner' ? 'Beginner to Intermediate' : 'Intermediate to Advanced',
        steps: [
          {
            id: 'step-1',
            title: 'Frontend Fundamentals',
            description: 'Master HTML, CSS, and JavaScript basics',
            duration: '4-6 weeks',
            difficulty: 'Beginner',
            courses: [
              { id: 'html-css', title: 'HTML & CSS Masterclass', duration: '2 weeks', type: 'course' },
              { id: 'js-basics', title: 'JavaScript Fundamentals', duration: '3 weeks', type: 'course' },
              { id: 'portfolio-1', title: 'Build Your First Portfolio', duration: '1 week', type: 'project' },
            ],
            skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
          },
          {
            id: 'step-2',
            title: 'Modern Frontend Framework',
            description: 'Learn React.js and modern development tools',
            duration: '6-8 weeks',
            difficulty: 'Intermediate',
            courses: [
              { id: 'react-basics', title: 'React.js Complete Guide', duration: '4 weeks', type: 'course' },
              { id: 'react-hooks', title: 'Advanced React Hooks', duration: '2 weeks', type: 'course' },
              { id: 'react-project', title: 'Build E-commerce App', duration: '2 weeks', type: 'project' },
            ],
            skills: ['React.js', 'JSX', 'State Management', 'Component Architecture'],
            prerequisites: ['step-1'],
          },
          {
            id: 'step-3',
            title: 'Backend Development',
            description: 'Server-side programming with Node.js',
            duration: '6-8 weeks',
            difficulty: 'Intermediate',
            courses: [
              { id: 'nodejs', title: 'Node.js & Express.js', duration: '4 weeks', type: 'course' },
              { id: 'database', title: 'MongoDB & Database Design', duration: '2 weeks', type: 'course' },
              { id: 'api-project', title: 'Build REST API', duration: '2 weeks', type: 'project' },
            ],
            skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
            prerequisites: ['step-2'],
          },
          {
            id: 'step-4',
            title: 'Full-Stack Integration',
            description: 'Connect frontend and backend, deploy applications',
            duration: '4-6 weeks',
            difficulty: 'Advanced',
            courses: [
              { id: 'fullstack', title: 'Full-Stack MERN Project', duration: '3 weeks', type: 'project' },
              { id: 'deployment', title: 'Deployment & DevOps', duration: '1 week', type: 'course' },
              { id: 'testing', title: 'Testing & Quality Assurance', duration: '2 weeks', type: 'course' },
            ],
            skills: ['Full-Stack Development', 'Deployment', 'Testing', 'DevOps'],
            prerequisites: ['step-3'],
          },
        ],
        milestones: [
          {
            id: 'milestone-1',
            title: 'Frontend Developer',
            description: 'Can build responsive web applications',
            stepIndex: 1,
          },
          {
            id: 'milestone-2',
            title: 'Backend Developer',
            description: 'Can create server-side applications and APIs',
            stepIndex: 2,
          },
          {
            id: 'milestone-3',
            title: 'Full-Stack Developer',
            description: 'Job-ready full-stack web developer',
            stepIndex: 3,
          },
        ],
      };
    }
    
    // Default roadmap for other interests
    return {
      title: 'Software Developer Roadmap',
      description: 'A personalized path based on your interests and goals',
      totalDuration: '4-6 months',
      difficulty: 'Beginner to Intermediate',
      steps: [
        {
          id: 'step-1',
          title: 'Programming Fundamentals',
          description: 'Learn core programming concepts',
          duration: '4 weeks',
          difficulty: 'Beginner',
          courses: [
            { id: 'programming-basics', title: 'Programming Fundamentals', duration: '4 weeks', type: 'course' },
          ],
          skills: ['Programming Logic', 'Problem Solving'],
        },
      ],
      milestones: [],
    };
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Badge variant="secondary" className="gap-2">
            <Zap className="h-3 w-3" />
            Personalized Learning Roadmap
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Your Path to Success
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get a personalized learning roadmap tailored to your interests, current skills, 
            and career goals. Our AI-powered system creates the perfect learning path for you.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
        >
          {ROADMAP_STATS.map((stat, index) => (
            <Card key={stat.title} className="text-center">
              <CardContent className="pt-4">
                <div className="flex justify-center mb-2">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {currentStep === 'assessment' ? (
          <RoadmapAssessment onComplete={handleAssessmentComplete} />
        ) : (
          generatedRoadmap && (
            <PersonalizedRoadmap 
              roadmap={generatedRoadmap} 
              userProfile={userProfile!}
              onRestart={() => {
                setCurrentStep('assessment');
                setUserProfile(null);
                setGeneratedRoadmap(null);
              }}
            />
          )
        )}
      </motion.div>

      {/* How It Works */}
      {currentStep === 'assessment' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">1. Assessment</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us about your interests, current skills, and career goals
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">2. AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI creates a personalized roadmap based on your profile
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">3. Start Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow your roadmap and track progress towards your goals
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}