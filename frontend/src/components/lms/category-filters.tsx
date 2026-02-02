// src/components/lms/category-filter.tsx

'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  Code,
  Smartphone,
  BarChart3,
  Brain,
  Palette,
  Globe,
  Shield,
  Cpu,
  Database,
  Layers,
  Terminal,
} from 'lucide-react';
import type { LmsCategory } from '@/types/lms.types';

interface CategoryFilterProps {
  categories: LmsCategory[];
  selectedCategory?: string;
  onSelect: (slug: string | null) => void;
  isLoading?: boolean;
}

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'web-development': Code,
  'mobile-development': Smartphone,
  'data-science': BarChart3,
  programming: Brain,
  design: Palette,
  'cloud-computing': Globe,
  cybersecurity: Shield,
  'machine-learning': Cpu,
  database: Database,
  devops: Layers,
  default: Terminal,
};

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  isLoading,
}: CategoryFilterProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  const allCategories = [
    { id: 'all', name: 'All Courses', slug: '', coursesCount: categories.reduce((a, c) => a + (c.coursesCount || 0), 0) },
    ...categories,
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {allCategories.map((category, index) => {
        const Icon = categoryIcons[category.slug] || categoryIcons.default;
        const isSelected = category.slug === '' 
          ? !selectedCategory 
          : selectedCategory === category.slug;

        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * index }}
            onClick={() => onSelect(category.slug || null)}
            className={`p-4 rounded-lg border text-center transition-all hover:shadow-md ${
              isSelected
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Icon className="h-6 w-6 mx-auto mb-2" />
            <div className="text-xs font-medium line-clamp-1">{category.name}</div>
            <div className="text-xs text-muted-foreground">
              {category.coursesCount || 0} courses
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}