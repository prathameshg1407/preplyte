'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Code,
  Smartphone,
  BarChart3,
  Palette,
  Globe,
  Shield,
  Brain,
  Database,
} from 'lucide-react';
import { UserProfile } from '@/app/lms/roadmap/page';

interface RoadmapAssessmentProps {
  onComplete: (profile: UserProfile) => void;
}

const INTERESTS = [
  { id: 'web-dev', name: 'Web Development', icon: Code, description: 'Build websites and web applications' },
  { id: 'mobile-dev', name: 'Mobile Development', icon: Smartphone, description: 'Create mobile apps for iOS and Android' },
  { id: 'data-science', name: 'Data Science', icon: BarChart3, description: 'Analyze data and build ML models' },
  { id: 'ui-ux', name: 'UI/UX Design', icon: Palette, description: 'Design user interfaces and experiences' },
  { id: 'cloud', name: 'Cloud Computing', icon: Globe, description: 'Work with cloud platforms and services' },
  { id: 'cybersecurity', name: 'Cybersecurity', icon: Shield, description: 'Protect systems and data' },
  { id: 'ai-ml', name: 'AI/Machine Learning', icon: Brain, description: 'Build intelligent systems' },
  { id: 'backend', name: 'Backend Development', icon: Database, description: 'Server-side programming and APIs' },
];

const SKILL_LEVELS = [
  { id: 'complete-beginner', name: 'Complete Beginner', description: 'No prior programming experience' },
  { id: 'some-basics', name: 'Some Basics', description: 'Know basic programming concepts' },
  { id: 'intermediate', name: 'Intermediate', description: 'Can build simple projects' },
  { id: 'advanced', name: 'Advanced', description: 'Experienced developer looking to specialize' },
];

const GOALS = [
  { id: 'get-job', name: 'Get a Job', description: 'Land my first tech job' },
  { id: 'switch-career', name: 'Career Switch', description: 'Transition from another field' },
  { id: 'freelance', name: 'Freelancing', description: 'Start freelancing projects' },
  { id: 'startup', name: 'Start a Business', description: 'Build my own product/startup' },
  { id: 'skill-upgrade', name: 'Skill Upgrade', description: 'Learn new technologies' },
  { id: 'promotion', name: 'Get Promoted', description: 'Advance in current role' },
];

const TIME_COMMITMENTS = [
  { id: '5-10', name: '5-10 hours/week', description: 'Part-time learning' },
  { id: '10-20', name: '10-20 hours/week', description: 'Dedicated learning' },
  { id: '20-40', name: '20-40 hours/week', description: 'Intensive learning' },
  { id: '40+', name: '40+ hours/week', description: 'Full-time commitment' },
];

const LEARNING_STYLES = [
  { id: 'video', name: 'Video Tutorials', description: 'Learn through video content' },
  { id: 'hands-on', name: 'Hands-on Projects', description: 'Learn by building things' },
  { id: 'reading', name: 'Reading & Documentation', description: 'Learn through text and docs' },
  { id: 'interactive', name: 'Interactive Coding', description: 'Learn through coding exercises' },
];

export function RoadmapAssessment({ onComplete }: RoadmapAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentLevel, setCurrentLevel] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [timeCommitment, setTimeCommitment] = useState('');
  const [learningStyle, setLearningStyle] = useState('');
  const [experience, setExperience] = useState<Record<string, string>>({});

  const totalSteps = 6;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const profile: UserProfile = {
      interests: selectedInterests.map(id => INTERESTS.find(i => i.id === id)?.name || ''),
      currentLevel: SKILL_LEVELS.find(l => l.id === currentLevel)?.name || '',
      goals: selectedGoals.map(id => GOALS.find(g => g.id === id)?.name || ''),
      timeCommitment: TIME_COMMITMENTS.find(t => t.id === timeCommitment)?.name || '',
      preferredLearningStyle: LEARNING_STYLES.find(s => s.id === learningStyle)?.name || '',
      experience,
    };
    onComplete(profile);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedInterests.length > 0;
      case 1: return currentLevel !== '';
      case 2: return selectedGoals.length > 0;
      case 3: return timeCommitment !== '';
      case 4: return learningStyle !== '';
      case 5: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">What interests you?</h2>
              <p className="text-muted-foreground">Select all areas you'd like to learn about</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {INTERESTS.map((interest) => (
                <motion.div
                  key={interest.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: INTERESTS.indexOf(interest) * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedInterests.includes(interest.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <interest.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{interest.name}</h3>
                          <p className="text-sm text-muted-foreground">{interest.description}</p>
                        </div>
                        {selectedInterests.includes(interest.id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">What's your current skill level?</h2>
              <p className="text-muted-foreground">This helps us customize the difficulty</p>
            </div>
            <RadioGroup value={currentLevel} onValueChange={setCurrentLevel}>
              <div className="grid gap-4">
                {SKILL_LEVELS.map((level) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: SKILL_LEVELS.indexOf(level) * 0.1 }}
                  >
                    <Card className={`cursor-pointer transition-all hover:shadow-md ${
                      currentLevel === level.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={level.id} id={level.id} />
                          <div className="flex-1">
                            <Label htmlFor={level.id} className="font-semibold cursor-pointer">
                              {level.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">What are your goals?</h2>
              <p className="text-muted-foreground">Select all that apply to you</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {GOALS.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: GOALS.indexOf(goal) * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedGoals.includes(goal.id) 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleGoalToggle(goal.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{goal.name}</h3>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                        </div>
                        {selectedGoals.includes(goal.id) && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">How much time can you commit?</h2>
              <p className="text-muted-foreground">This helps us plan your learning schedule</p>
            </div>
            <RadioGroup value={timeCommitment} onValueChange={setTimeCommitment}>
              <div className="grid gap-4">
                {TIME_COMMITMENTS.map((time) => (
                  <motion.div
                    key={time.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: TIME_COMMITMENTS.indexOf(time) * 0.1 }}
                  >
                    <Card className={`cursor-pointer transition-all hover:shadow-md ${
                      timeCommitment === time.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={time.id} id={time.id} />
                          <div className="flex-1">
                            <Label htmlFor={time.id} className="font-semibold cursor-pointer">
                              {time.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{time.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">How do you prefer to learn?</h2>
              <p className="text-muted-foreground">Choose your preferred learning method</p>
            </div>
            <RadioGroup value={learningStyle} onValueChange={setLearningStyle}>
              <div className="grid gap-4">
                {LEARNING_STYLES.map((style) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: LEARNING_STYLES.indexOf(style) * 0.1 }}
                  >
                    <Card className={`cursor-pointer transition-all hover:shadow-md ${
                      learningStyle === style.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={style.id} id={style.id} />
                          <div className="flex-1">
                            <Label htmlFor={style.id} className="font-semibold cursor-pointer">
                              {style.name}
                            </Label>
                            <p className="text-sm text-muted-foreground">{style.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Assessment Complete!</h2>
              <p className="text-muted-foreground">Review your selections and generate your personalized roadmap</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedInterests.map(id => {
                      const interest = INTERESTS.find(i => i.id === id);
                      return (
                        <Badge key={id} variant="secondary">
                          {interest?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Your Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedGoals.map(id => {
                      const goal = GOALS.find(g => g.id === id);
                      return (
                        <Badge key={id} variant="secondary">
                          {goal?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Skill Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">
                    {SKILL_LEVELS.find(l => l.id === currentLevel)?.name}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Time Commitment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline">
                    {TIME_COMMITMENTS.find(t => t.id === timeCommitment)?.name}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">Learning Assessment</h1>
            <Badge variant="outline">
              Step {currentStep + 1} of {totalSteps}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === totalSteps - 1 ? (
            <Button onClick={handleComplete} disabled={!canProceed()}>
              Generate Roadmap
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}