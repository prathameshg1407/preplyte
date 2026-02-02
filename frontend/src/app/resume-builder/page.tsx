'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Download,
  Eye,
  Star,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Award,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Plus,
} from 'lucide-react';
import { ResumeTemplates } from '@/components/resume-builder/resume-templates';
import { ATSScoreChecker } from '@/components/resume-builder/ats-score-checker';
import { ResumeEditor } from '@/components/resume-builder/resume-editor';

const RESUME_STATS = [
  {
    title: 'Templates Available',
    value: '12+',
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
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

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
          {RESUME_STATS.map((stat, index) => (
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
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2">
              <Plus className="h-4 w-4" />
              Build Resume
            </TabsTrigger>
            <TabsTrigger value="ats-checker" className="gap-2">
              <Award className="h-4 w-4" />
              ATS Checker
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <ResumeTemplates 
              onSelectTemplate={setSelectedTemplate}
              selectedTemplate={selectedTemplate}
            />
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <ResumeEditor selectedTemplate={selectedTemplate} />
          </TabsContent>

          <TabsContent value="ats-checker" className="space-y-6">
            <ATSScoreChecker />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}