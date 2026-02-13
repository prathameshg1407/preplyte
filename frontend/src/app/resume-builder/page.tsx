'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Zap,
  CheckCircle,
  TrendingUp,
  Users,
  Award,
  List,
  Plus,
} from 'lucide-react';
import { TemplateSelector } from '@/components/resume-builder/template-selector';
import { ResumeListNew } from '@/components/resume-builder/resume-list-new';
import { ATSScoreChecker } from '@/components/resume-builder/ats-score-checker';

const RESUME_STATS = [
  {
    title: 'Templates Available',
    value: '6+',
    description: 'Industry-ready designs',
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'ATS Compatibility',
    value: '95%',
    description: 'Pass rate with our templates',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'Students Helped',
    value: '5K+',
    description: 'Successful placements',
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Average Score',
    value: '8.5/10',
    description: 'ATS score improvement',
    icon: TrendingUp,
    color: 'text-orange-600 dark:text-orange-400',
  },
];

export default function ResumeBuilderPage() {
  const [activeTab, setActiveTab] = useState('my-resumes');

  // Handle tab from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['my-resumes', 'templates', 'ats-checker'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Badge variant="secondary" className="gap-2">
            <Zap className="h-3 w-3" />
            Resume Builder
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Your Perfect Resume
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Build professional resumes with industry-ready templates and get instant ATS compatibility scores
            to maximize your chances of landing interviews.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
        >
          {RESUME_STATS.map((stat) => (
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-resumes" className="gap-2">
              <List className="h-4 w-4" />
              My Resumes
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Plus className="h-4 w-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="ats-checker" className="gap-2">
              <Award className="h-4 w-4" />
              ATS Checker
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-resumes" className="space-y-6">
            <ResumeListNew />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplateSelector />
          </TabsContent>

          <TabsContent value="ats-checker" className="space-y-6">
            <ATSScoreChecker />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}