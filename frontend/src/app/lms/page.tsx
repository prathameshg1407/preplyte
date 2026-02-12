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
} from 'lucide-react';
import { CourseGrid } from '@/components/lms/course-grid';
import { CategoryFilter } from '@/components/lms/category-filters';
import { useCategories, useCourses, useLmsStats } from '@/lib/hooks/lms/use-lms';
import { useLmsStore } from '@/lib/store/lms-store';
import { useDebounce } from '@/lib/hooks/use-debounce';

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
            Learning Management System
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Advance Your Career with Expert-Led Courses
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn from industry experts, build real projects, and get job-ready with our
            comprehensive courses designed for placement success.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
        >
          {statsItems.map((stat) => (
            <Card key={stat.title} className="text-center">
              <CardContent className="pt-4">
                {statsLoading ? (
                  <>
                    <Skeleton className="h-8 w-8 rounded-lg mx-auto mb-2" />
                    <Skeleton className="h-8 w-16 mx-auto mb-1" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                  </>
                ) : (
                  <>
                    <div className="flex justify-center mb-2">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold">
                      {stat.value}
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.description}</div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, instructors, or topics..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filters.difficulty || ''}
              onChange={(e) => setFilters({ difficulty: e.target.value as 'EASY' | 'MEDIUM' | 'HARD' || undefined })}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="">All Levels</option>
              <option value="EASY">Beginner</option>
              <option value="MEDIUM">Intermediate</option>
              <option value="HARD">Advanced</option>
            </select>
            <select
              value={filters.priceRange || 'all'}
              onChange={(e) => setFilters({ priceRange: e.target.value as 'free' | 'paid' | 'all' })}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="all">All Prices</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
            <select
              value={filters.sortBy || 'popular'}
              onChange={(e) => setFilters({ sortBy: e.target.value as 'popular' | 'newest' | 'price-low' | 'price-high' })}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
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
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
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

      {/* Learning Path CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg font-semibold mb-1">
                  Get Your Personalized Learning Roadmap
                </h3>
                <p className="text-muted-foreground text-sm">
                  Take our skill assessment to get a customized learning path based on your
                  interests, current skills, and career goals.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/lms/roadmap">
                    <Play className="h-4 w-4 mr-2" />
                    Create Roadmap
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/lms/assessment">
                    <Target className="h-4 w-4 mr-2" />
                    Take Assessment
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}