// src/app/opportunities/page.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  GraduationCap, 
  Trophy, 
  ArrowRight, 
  Sparkles,
  Search,
  Building2,
  Clock,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const OPPORTUNITY_TYPES = [
  {
    title: 'Full-time Jobs',
    description: 'Launch your career with established companies and exciting startups.',
    icon: Briefcase,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    href: '/opportunities/jobs',
    count: '50+ Active',
    tags: ['Entry Level', 'Remote', 'MNCs']
  },
  {
    title: 'Internships',
    description: 'Gain practical experience and build your portfolio with top industry mentors.',
    icon: GraduationCap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    href: '/opportunities/internships',
    count: '120+ Open',
    tags: ['Summer 2024', 'Paid', 'PPO Potential']
  },
  {
    title: 'Hackathons',
    description: 'Collaborate, innovate, and compete for prizes and recognition.',
    icon: Trophy,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    href: '/hackathons',
    count: '15+ Ongoing',
    tags: ['Team Events', 'Prizes', 'Networking']
  }
];

export default function OpportunitiesLandingPage() {
  return (
    <div className="container mx-auto px-4 py-12 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full bg-primary/10 text-primary border-none mb-4">
            <Sparkles className="h-3.5 w-3.5 mr-2 inline" />
            Your Future Starts Here
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Discover Your Next <span className="text-primary">Opportunity</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-6 leading-relaxed">
            The all-in-one platform to find jobs, internships, and hackathons tailored to your skills and career goals.
          </p>
        </motion.div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-8 md:grid-cols-3">
        {OPPORTUNITY_TYPES.map((type, index) => (
          <motion.div
            key={type.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden border-2">
              <CardHeader>
                <div className={`h-14 w-14 rounded-2xl ${type.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <type.icon className={`h-7 w-7 ${type.color}`} />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold">{type.title}</CardTitle>
                    <Badge variant="secondary" className="mt-2 text-[10px] font-mono uppercase tracking-wider">
                      {type.count}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  {type.description}
                </CardDescription>
                <div className="flex flex-wrap gap-2">
                  {type.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/30">
                <Button className="w-full group" asChild>
                  <Link href={type.href}>
                    Explore {type.title}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Featured/Info Section */}
      <div className="grid gap-12 lg:grid-cols-2 items-center bg-muted/20 p-8 rounded-[40px] border">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold">Why Preplyte?</h2>
          <div className="grid gap-6">
             <InfoItem 
                icon={Target} 
                title="Personalized Recommendations" 
                description="We match opportunities based on your mock test performance and skill profile."
             />
             <InfoItem 
                icon={Search} 
                title="Advanced Filtering" 
                description="Filter by stipend, location, duration, and role to find your perfect fit."
             />
             <InfoItem 
                icon={Clock} 
                title="Real-time Application Tracking" 
                description="Keep track of every application status directly from your student dashboard."
             />
          </div>
        </div>
        <div className="relative">
           <div className="aspect-square bg-gradient-to-tr from-primary/20 to-violet-500/20 rounded-full animate-pulse-slow absolute inset-0 blur-3xl -z-10" />
           <div className="bg-card border-4 border-muted rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 p-3 bg-primary/5 rounded-2xl">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">New Opportunity Added</p>
                  <p className="text-xs text-muted-foreground">Software Engineer @ TechCorp</p>
                </div>
              </div>
              <div className="space-y-4">
                 <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                 <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                 <div className="h-24 w-full bg-muted/50 rounded-2xl border-2 border-dashed border-muted animate-pulse" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, title, description }: any) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-zinc-950 transition-colors">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
