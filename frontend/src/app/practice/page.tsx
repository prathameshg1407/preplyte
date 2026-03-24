// app/practice/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Brain,
  Code2,
  Mic,
  ArrowRight,
  Clock,
  Zap,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  History,
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Play
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface PracticeModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  gradient: string;
  stats: {
    questions: string;
    avgTime: string;
    completion?: string;
  };
  highlights: string[];
  status: 'available' | 'coming-soon' | 'beta';
}

const modules: PracticeModule[] = [
  {
    id: 'aptitude',
    title: 'Aptitude',
    subtitle: 'Reasoning & Problem Solving',
    description: 'Master quantitative reasoning, logical thinking, and verbal skills with adaptive practice sessions.',
    icon: Brain,
    href: '/practice/aptitude',
    color: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500/20 via-violet-500/10 to-transparent',
    stats: {
      questions: '2,500+',
      avgTime: '45 min',
      completion: '78%'
    },
    highlights: [
      'Quantitative & Logical Reasoning',
      'Verbal Ability & Comprehension',
      'Data Interpretation',
      'Adaptive difficulty'
    ],
    status: 'available'
  },
  {
    id: 'coding',
    title: 'Coding',
    subtitle: 'DSA & Problem Solving',
    description: 'Solve real interview problems with our powerful code editor. Auto-graded with test cases.',
    icon: Code2,
    href: '/practice/machine',
    color: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/20 via-emerald-500/10 to-transparent',
    stats: {
      questions: '500+',
      avgTime: '60 min'
    },
    highlights: [
      'Data Structures & Algorithms',
      'Multiple language support',
      'Company-wise problems',
      'Solution explanations'
    ],
    status: 'available'
  },
  {
    id: 'interview',
    title: 'Mock Interview',
    subtitle: 'AI-Powered Practice',
    description: 'Practice with our AI interviewer. Get real-time feedback on your responses and communication.',
    icon: Mic,
    href: '/practice/ai-interview',
    color: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/20 via-amber-500/10 to-transparent',
    stats: {
      questions: 'Unlimited',
      avgTime: '20 min'
    },
    highlights: [
      'Technical & HR rounds',
      'Real-time feedback',
      'Industry-specific questions',
      'Communication analysis'
    ],
    status: 'beta'
  },
  {
    id: 'roadmap',
    title: 'Career Roadmap',
    subtitle: 'AI Career Guidance',
    description: 'Don\'t know what to study? Let our AI guide you through a personalized learning path based on your goals.',
    icon: Sparkles,
    href: '/practice/roadmap',
    color: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500/20 via-blue-500/10 to-transparent',
    stats: {
      questions: 'Dynamic',
      avgTime: '5 min'
    },
    highlights: [
      'Personalized goals',
      'Curated tech stacks',
      'Platform course matching',
      'Step-by-step guidance'
    ],
    status: 'available'
  }
];

const quickActions = [
  {
    label: 'Continue Practice',
    description: 'Resume where you left off',
    icon: History,
    href: '/practice/aptitude',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10'
  },
  {
    label: 'View Progress',
    description: 'Check your analytics',
    icon: BarChart3,
    href: '/dashboard',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10'
  },
  {
    label: 'Daily Challenge',
    description: 'Today\'s problem set',
    icon: Zap,
    href: '/practice/aptitude',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10'
  }
];

const stats = [
  { value: '3,000+', label: 'Questions', icon: Target },
  { value: '50K+', label: 'Sessions', icon: TrendingUp },
  { value: '92%', label: 'Success Rate', icon: Trophy }
];

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl" />
        <div className="absolute left-0 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/5 to-transparent blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-gradient-to-l from-emerald-500/5 to-transparent blur-3xl" />
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-20">

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
          >
            <Sparkles className="h-4 w-4" />
            Smart Practice System
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Practice Smarter,
            <span className="block bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
              Not Harder
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground"
          >
            Comprehensive preparation platform with adaptive learning.
            Track progress, identify weaknesses, and improve systematically.
          </motion.p>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto flex max-w-lg items-center justify-center gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <div className="mb-1 flex items-center justify-center gap-1.5">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Link
                  href={action.href}
                  className="group flex items-center gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-muted/50 hover:shadow-lg"
                >
                  <div className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                    action.bg
                  )}>
                    <action.icon className={cn("h-6 w-6", action.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{action.label}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Main Modules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Practice Modules</h2>
            <p className="mt-1 text-muted-foreground">Choose a module to start practicing</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                onClick={() => router.push(module.href)}
                index={index}
              />
            ))}
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-16"
        >
          <div className="overflow-hidden rounded-2xl border-2 border-border bg-card">
            <div className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {[
                {
                  title: 'Adaptive Learning',
                  description: 'Questions adapt to your skill level. Focus on what matters most for your growth.',
                  icon: Brain,
                  color: 'text-violet-600 dark:text-violet-400',
                  bg: 'bg-violet-500/10'
                },
                {
                  title: 'Detailed Analytics',
                  description: 'Track your progress with comprehensive performance insights and trends.',
                  icon: BarChart3,
                  color: 'text-blue-600 dark:text-blue-400',
                  bg: 'bg-blue-500/10'
                },
                {
                  title: 'Expert Solutions',
                  description: 'Learn from detailed explanations and strategies for every question.',
                  icon: CheckCircle2,
                  color: 'text-emerald-600 dark:text-emerald-400',
                  bg: 'bg-emerald-500/10'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-6 lg:p-8"
                >
                  <div className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
                    feature.bg
                  )}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center lg:p-12">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
            </div>

            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary"
              >
                <Play className="h-7 w-7 text-primary-foreground" />
              </motion.div>

              <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Ready to Begin?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                Start with aptitude tests — the most common first round in campus placements.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => router.push('/practice/aptitude')}
                  className="gap-2 text-base"
                >
                  Start Aptitude Practice
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/practice/machine')}
                  className="gap-2 text-base"
                >
                  <Code2 className="h-4 w-4" />
                  Try Coding
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

// Module Card Component
function ModuleCard({
  module,
  onClick,
  index
}: {
  module: PracticeModule;
  onClick: () => void;
  index: number;
}) {
  const isAvailable = module.status === 'available' || module.status === 'beta';
  const Icon = module.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
      whileHover={isAvailable ? { y: -4 } : {}}
      onClick={isAvailable ? onClick : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl border-2 bg-card transition-all duration-300",
        isAvailable
          ? "cursor-pointer border-border hover:border-primary/30 hover:shadow-xl"
          : "opacity-60 border-border"
      )}
    >
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        module.gradient
      )} />

      {/* Status Badge */}
      {module.status !== 'available' && (
        <div className="absolute right-4 top-4 z-10">
          <Badge
            variant="secondary"
            className={cn(
              module.status === 'beta'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {module.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </Badge>
        </div>
      )}

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6">
          <div className={cn(
            "mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            `bg-${module.color.split('-')[1]}-500/10`
          )}>
            <Icon className={cn("h-7 w-7", module.color)} />
          </div>
          <div className="mb-1 text-sm text-muted-foreground">{module.subtitle}</div>
          <h3 className="text-xl font-bold">{module.title}</h3>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          {module.description}
        </p>

        {/* Highlights */}
        <ul className="mb-6 space-y-2.5">
          {module.highlights.slice(0, 3).map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 + i * 0.05 }}
              className="flex items-center gap-2.5 text-sm"
            >
              <div className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                `bg-${module.color.split('-')[1]}-500/10`
              )}>
                <CheckCircle2 className={cn("h-3 w-3", module.color)} />
              </div>
              <span>{item}</span>
            </motion.li>
          ))}
        </ul>

        {/* Stats */}
        <div className="mb-6 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{module.stats.questions}</span>
            <span className="text-muted-foreground">questions</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{module.stats.avgTime}</span>
          </div>
        </div>

        {/* Action */}
        {isAvailable ? (
          <Button className="w-full gap-2 group/btn" variant="default">
            <Play className="h-4 w-4" />
            Start Practice
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" disabled>
            Coming Soon
          </Button>
        )}
      </div>
    </motion.div>
  );
}