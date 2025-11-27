// app/practice/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
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
  Sparkles
} from 'lucide-react';

interface PracticeModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  href: string;
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
    description: 'Solve real interview problems with our powerful code editor. Auto-graded with detailed test cases.',
    icon: Code2,
    href: '/practice/machine',
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
    description: 'Practice with our AI interviewer. Get real-time feedback on your responses and body language.',
    icon: Mic,
    href: '/practice/ai-interview',
    stats: {
      questions: 'Unlimited',
      avgTime: '20 min'
    },
    highlights: [
      'Technical & HR rounds',
      'Voice & video analysis',
      'Instant feedback',
      'Industry-specific questions'
    ],
    status: 'beta'
  }
];

const quickActions = [
  {
    label: 'Continue Practice',
    description: 'Resume where you left off',
    icon: History,
    href: '/practice/aptitude/history'
  },
  {
    label: 'View Progress',
    description: 'Check your analytics',
    icon: BarChart3,
    href: '/dashboard/progress'
  },
  {
    label: 'Daily Challenge',
    description: 'Today\'s problem set',
    icon: Zap,
    href: '/practice/daily'
  }
];

export default function PracticePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary via-background to-background" />
      
      <div className="container mx-auto max-w-6xl px-4 py-12 lg:py-20">
        
        {/* Hero Section */}
        <section className="mb-16 text-center lg:mb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Smart Practice System</span>
          </div>
          
          <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Practice Smarter,
            <span className="block text-muted-foreground">Not Harder</span>
          </h1>
          
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
            Comprehensive preparation platform with adaptive learning. 
            Track progress, identify weaknesses, and improve systematically.
          </p>

          {/* Quick Stats */}
          <div className="mx-auto flex max-w-md items-center justify-center gap-8 text-center">
            {[
              { value: '3,000+', label: 'Questions' },
              { value: '50K+', label: 'Sessions' },
              { value: '92%', label: 'Success Rate' }
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-16">
          <div className="grid gap-3 sm:grid-cols-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>

        {/* Main Modules */}
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Practice Modules</h2>
              <p className="mt-1 text-muted-foreground">Choose a module to start practicing</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {modules.map((module) => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                onClick={() => router.push(module.href)} 
              />
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <div className="rounded-xl border border-border bg-card">
            <div className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
              {[
                {
                  title: 'Adaptive Learning',
                  description: 'Questions adapt to your skill level. Focus on what matters most.',
                  icon: Brain
                },
                {
                  title: 'Detailed Analytics',
                  description: 'Track your progress with comprehensive performance insights.',
                  icon: BarChart3
                },
                {
                  title: 'Expert Solutions',
                  description: 'Learn from detailed explanations for every question.',
                  icon: CheckCircle2
                }
              ].map((feature) => (
                <div key={feature.title} className="p-6 lg:p-8">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-8 text-center lg:p-12">
            {/* Decorative elements */}
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-secondary/50 blur-2xl" />
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-secondary/50 blur-2xl" />
            
            <div className="relative">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to Begin?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                Start with aptitude tests — the most common first round in campus placements.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" onClick={() => router.push('/practice/aptitude')}>
                  Start Aptitude Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="ghost" onClick={() => router.push('/practice/aptitude/history')}>
                  View Past Sessions
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// Module Card Component
function ModuleCard({ 
  module, 
  onClick 
}: { 
  module: PracticeModule; 
  onClick: () => void;
}) {
  const isAvailable = module.status === 'available' || module.status === 'beta';
  
  return (
    <Card 
      className={`group relative overflow-hidden border-border transition-all ${
        isAvailable 
          ? 'cursor-pointer hover:border-foreground/20 hover:shadow-lg' 
          : 'opacity-60'
      }`}
      onClick={isAvailable ? onClick : undefined}
    >
      {/* Status Badge */}
      {module.status !== 'available' && (
        <div className="absolute right-4 top-4 z-10">
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            module.status === 'beta' 
              ? 'border border-border bg-secondary' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {module.status === 'beta' ? 'Beta' : 'Coming Soon'}
          </span>
        </div>
      )}

      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-secondary transition-colors group-hover:bg-secondary/80">
            <module.icon className="h-7 w-7" />
          </div>
          <div className="mb-1 text-sm text-muted-foreground">{module.subtitle}</div>
          <h3 className="text-xl font-semibold">{module.title}</h3>
        </div>

        {/* Description */}
        <p className="mb-6 text-sm text-muted-foreground">
          {module.description}
        </p>

        {/* Highlights */}
        <ul className="mb-6 space-y-2">
          {module.highlights.slice(0, 3).map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* Stats */}
        <div className="mb-6 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">{module.stats.questions}</span>
            <span>questions</span>
          </div>
          <div className="h-1 w-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{module.stats.avgTime}</span>
          </div>
        </div>

        {/* Action */}
        {isAvailable ? (
          <Button className="w-full gap-2" variant="outline">
            Start Practice
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        ) : (
          <Button className="w-full" variant="secondary" disabled>
            Coming Soon
          </Button>
        )}
      </CardContent>
    </Card>
  );
}