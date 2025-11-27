// src/app/page.tsx

'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Brain,
  Code2,
  Trophy,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  Check,
  Zap,
  Sparkles,
  Play,
  BarChart3,
  BookOpen,
  GraduationCap,
  Building2,
  Star,
} from 'lucide-react';
import { cn } from '../lib/utils';

const stats = [
  { value: '10K+', label: 'Questions', icon: BookOpen },
  { value: '50+', label: 'Institutes', icon: Building2 },
  { value: '25K+', label: 'Students', icon: GraduationCap },
  { value: '95%', label: 'Success Rate', icon: Star },
];

const features = [
  {
    icon: Brain,
    title: 'Aptitude Tests',
    description: 'Practice quantitative, verbal, and logical reasoning',
    features: ['10,000+ curated questions', 'Detailed solutions', 'Topic-wise practice'],
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Code2,
    title: 'Coding Challenges',
    description: 'Solve programming problems in multiple languages',
    features: ['Real interview questions', 'Auto-graded submissions', 'Multiple test cases'],
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Target,
    title: 'Mock Drives',
    description: 'Experience real placement test environment',
    features: ['Company-specific tests', 'Timed assessments', 'Performance analytics'],
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your improvement with detailed analytics',
    features: ['Performance insights', 'Weakness identification', 'Personalized tips'],
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Compete with peers and track rankings',
    features: ['Institute rankings', 'Global leaderboard', 'Achievement badges'],
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10',
  },
  {
    icon: Users,
    title: 'Institute Portal',
    description: 'Dedicated dashboards for institutes',
    features: ['Student management', 'Batch analytics', 'Custom assessments'],
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
];

const steps = [
  {
    step: '01',
    title: 'Create Account',
    description: 'Sign up for free and set up your profile in seconds',
  },
  {
    step: '02',
    title: 'Start Practicing',
    description: 'Choose your topics and begin solving questions',
  },
  {
    step: '03',
    title: 'Track & Improve',
    description: 'Monitor progress and focus on your weak areas',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl" />
          <div className="absolute left-0 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500/10 to-transparent blur-3xl" />
          <div className="absolute right-0 top-1/3 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-gradient-to-l from-emerald-500/10 to-transparent blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge
                variant="secondary"
                className="mb-8 gap-2 px-4 py-2 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                Trusted by 50+ Institutes
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Master Your Campus
              <span className="block bg-gradient-to-r from-primary via-violet-500 to-purple-500 bg-clip-text text-transparent">
                Placement Prep
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground"
            >
              Practice aptitude tests, coding challenges, and mock interviews.
              Track your progress with detailed analytics and land your dream job.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Button size="lg" asChild className="gap-2 text-base">
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base">
                <Link href="/practice">
                  <Play className="h-4 w-4" />
                  Try Demo Test
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <Badge variant="secondary" className="mb-4">
              Features
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Comprehensive tools designed specifically for campus placements
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <Badge variant="secondary" className="mb-4">
              Getting Started
            </Badge>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Start your preparation in three simple steps
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-6 hidden h-0.5 w-full bg-gradient-to-r from-border to-transparent md:block" />
                )}

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground"
                >
                  {item.step}
                </motion.div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center lg:p-16"
          >
            {/* Decorative elements */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
            </div>

            <div className="relative">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary"
              >
                <Zap className="h-8 w-8 text-primary-foreground" />
              </motion.div>

              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Ace Your Placements?
              </h2>
              <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                Join thousands of students preparing with Preplyte.
                Start your journey today.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" asChild className="gap-2 text-base">
                  <Link href="/register">
                    Start Preparing Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                P
              </div>
              <span className="font-semibold">Preplyte</span>
            </div>

            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Preplyte. All rights reserved.
            </div>

            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Support'].map((link) => (
                <Link
                  key={link}
                  href={`/${link.toLowerCase()}`}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// Feature Card Component
function FeatureCard({
  feature,
  index,
}: {
  feature: typeof features[0];
  index: number;
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group rounded-2xl border-2 border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl"
    >
      <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl', feature.bg)}>
        <Icon className={cn('h-6 w-6', feature.color)} />
      </div>

      <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{feature.description}</p>

      <ul className="space-y-2">
        {feature.features.map((item, i) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + i * 0.05 }}
            className="flex items-center gap-2 text-sm"
          >
            <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full', feature.bg)}>
              <Check className={cn('h-3 w-3', feature.color)} />
            </div>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}