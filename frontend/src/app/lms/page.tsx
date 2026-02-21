// src/app/lms/page.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Search,
  Users,
  Play,
  Award,
  TrendingUp,
  Zap,
  Target,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { CourseGrid } from '@/components/lms/course-grid';
import { CategoryFilter } from '@/components/lms/category-filters';
import { useCategories, useCourses, useLmsStats } from '@/lib/hooks/lms/use-lms';
import { useLmsStore } from '@/lib/store/lms-store';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { DifficultyLevel } from '@/types/lms.types';

export default function LMSPage() {
  const { filters, setFilters } = useLmsStore();
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Queries
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: stats, isLoading: statsLoading } = useLmsStats();
  const { data: coursesData, isLoading: coursesLoading } = useCourses(filters);

  // Update search filter when debounced value changes
  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const statsItems = [
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      suffix: '+',
      description: 'Comprehensive curriculum',
      icon: BookOpen,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Expert Instructors',
      value: stats?.totalInstructors || 0,
      suffix: '+',
      description: 'Industry professionals',
      icon: Users,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Students Enrolled',
      value: stats?.totalStudents ? `${(stats.totalStudents / 1000).toFixed(0)}K` : '0',
      suffix: '+',
      description: 'Active learners',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Completion Rate',
      value: stats?.averageCompletionRate || 0,
      suffix: '%',
      description: 'Success stories',
      icon: Award,
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/10 p-8 md:p-12 mb-8">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <Badge variant="secondary" className="gap-2 px-3 py-1">
              <Zap className="h-3 w-3 text-primary fill-primary" />
              AI-Powered Learning
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Advance Your Career with <span className="text-primary">Expert-Led</span> Courses
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Learn from industry experts, build real projects, and get job-ready with our
              comprehensive curriculum designed for placement success.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <Button size="lg" asChild className="rounded-full px-8 h-12">
                <Link href="/lms" className="gap-2">
                  Browse Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 h-12 border-primary/20 hover:bg-primary/5">
                <Link href="/lms/roadmap" className="gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Your AI Roadmap
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:flex flex-1 justify-end">
            <div className="relative">
              <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-card border border-primary/10 rounded-2xl p-6 shadow-2xl space-y-4 w-72">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Goal Focused</div>
                    <div className="text-[10px] text-muted-foreground">Tailored for your success</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span>Current Skills</span>
                    <span className="font-bold">65%</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-primary hover:text-primary hover:bg-primary/5" asChild>
                    <Link href="/lms/roadmap">Update Roadmap</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - Reduced prominence since we have a big hero now */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {statsItems.map((stat) => (
          <Card key={stat.title} className="text-center border-none bg-muted/30">
            <CardContent className="pt-4 flex items-center justify-center gap-4">
              {statsLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border border-border">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">
                      {stat.value}
                      {stat.suffix}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.title}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 pt-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, instructors, or topics..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.difficulty || ''}
              onChange={(e) => setFilters({ difficulty: (e.target.value as DifficultyLevel) || undefined })}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm h-10"
            >
              <option value="">All Levels</option>
              <option value="EASY">Beginner</option>
              <option value="MEDIUM">Intermediate</option>
              <option value="HARD">Advanced</option>
            </select>
            <select
              value={filters.priceRange || 'all'}
              onChange={(e) => setFilters({ priceRange: e.target.value as 'free' | 'paid' | 'all' })}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm h-10"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={filters.sortBy || 'popular'}
              onChange={(e) => setFilters({ sortBy: e.target.value as 'popular' | 'newest' | 'price-low' | 'price-high' })}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm h-10"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4">Browse Categories</h2>
        <CategoryFilter
          categories={categories || []}
          selectedCategory={filters.categorySlug}
          onSelect={(slug: string | null) => setFilters({ categorySlug: slug || undefined })}
          isLoading={categoriesLoading}
        />
      </motion.div>

      {/* Course Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {filters.categorySlug
              ? `${categories?.find((c) => c.slug === filters.categorySlug)?.name} Courses`
              : 'All Courses'}
          </h2>
          <div className="text-sm text-muted-foreground">
            {coursesData?.pagination.total || 0} course
            {(coursesData?.pagination.total || 0) !== 1 ? 's' : ''} found
          </div>
        </div>

        <CourseGrid
          courses={coursesData?.courses || []}
          isLoading={coursesLoading}
          pagination={coursesData?.pagination}
          onPageChange={(page) => setFilters({ page })}
        />
      </motion.div>
    </div>
  );
}