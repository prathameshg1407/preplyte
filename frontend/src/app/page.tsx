import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import {
  Brain,
  Code2,
  Trophy,
  Users,
  Target,
  TrendingUp,
  ArrowRight,
  Check,
  Zap
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-32 lg:py-40">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
              <span className="text-sm font-medium">Trusted by 50+ Institutes</span>
            </div>

            <h1 className="mb-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Master Your Campus
              <br />
              <span className="text-muted-foreground">Placement Prep</span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              Practice aptitude tests, coding challenges, and mock interviews.
              Track your progress and land your dream job.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/practice/aptitude">Try Demo Test</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Subtle gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/40 via-background to-background" />
      </section>

      {/* Stats Section */}
      <section className="border-y border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '10K+', label: 'Questions' },
              { value: '50+', label: 'Institutes' },
              { value: '25K+', label: 'Students' },
              { value: '95%', label: 'Success Rate' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-semibold tracking-tight">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-semibold tracking-tight">
              Everything You Need
            </h2>
            <p className="text-muted-foreground">
              Comprehensive tools designed for campus placements
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="Aptitude Tests"
              description="Practice quantitative, verbal, and logical reasoning"
              features={['10,000+ curated questions', 'Detailed solutions', 'Topic-wise practice']}
            />

            <FeatureCard
              icon={Code2}
              title="Coding Challenges"
              description="Solve programming problems in multiple languages"
              features={['Real interview questions', 'Auto-graded submissions', 'Multiple test cases']}
            />

            <FeatureCard
              icon={Target}
              title="Mock Drives"
              description="Experience real placement test environment"
              features={['Company-specific tests', 'Timed assessments', 'Performance analytics']}
            />

            <FeatureCard
              icon={TrendingUp}
              title="Progress Tracking"
              description="Monitor your improvement with detailed analytics"
              features={['Performance insights', 'Weakness identification', 'Personalized tips']}
            />

            <FeatureCard
              icon={Trophy}
              title="Leaderboards"
              description="Compete with peers and track rankings"
              features={['Institute rankings', 'Global leaderboard', 'Achievement badges']}
            />

            <FeatureCard
              icon={Users}
              title="Institute Portal"
              description="Dedicated dashboards for institutes"
              features={['Student management', 'Batch analytics', 'Custom assessments']}
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-border bg-secondary/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-3 text-3xl font-semibold tracking-tight">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Start your preparation in three simple steps
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Create Account',
                description: 'Sign up for free and set up your profile',
              },
              {
                step: '02',
                title: 'Start Practicing',
                description: 'Choose your topics and begin solving questions',
              },
              {
                step: '03',
                title: 'Track & Improve',
                description: 'Monitor progress and focus on weak areas',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold">
                  {item.step}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight">
              Ready to Ace Your Placements?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of students preparing with Preplyte.
              Start your journey today.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Preparing Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
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
  icon: Icon,
  title,
  description,
  features,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <Card className="border-border bg-card transition-colors hover:bg-secondary/50">
      <CardHeader className="pb-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="h-5 w-5" />
        </div>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-muted-foreground" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}