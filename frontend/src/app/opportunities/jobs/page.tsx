// src/app/opportunities/jobs/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Job, 
  JobType, 
  WorkMode, 
  OpportunityStatus,
  PaginatedResponse 
} from '@/types/event.types';
import { opportunityService, JobListParams } from '@/lib/api/services/opportunity.service';
import { OpportunityCard } from '@/components/opportunities/OpportunityCard';
import { FilterSidebar, FilterSection } from '@/components/shared/FilterSidebar';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_SECTIONS: FilterSection[] = [
  {
    id: 'jobType',
    label: 'Job Type',
    type: 'checkbox',
    options: [
      { label: 'Full Time', value: JobType.FULL_TIME },
      { label: 'Part Time', value: JobType.PART_TIME },
      { label: 'Contract', value: JobType.CONTRACT },
      { label: 'Freelance', value: JobType.FREELANCE },
    ]
  },
  {
    id: 'workMode',
    label: 'Work Mode',
    type: 'checkbox',
    options: [
      { label: 'On-site', value: WorkMode.ON_SITE },
      { label: 'Remote', value: WorkMode.REMOTE },
      { label: 'Hybrid', value: WorkMode.HYBRID },
    ]
  }
];

export default function JobsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResponse<Job> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    jobType: [],
    workMode: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params: JobListParams = {
        page: currentPage,
        limit: 9,
        search: searchQuery || undefined,
        status: [OpportunityStatus.PUBLISHED],
        jobType: selectedFilters.jobType.length > 0 ? selectedFilters.jobType as JobType[] : undefined,
        workMode: selectedFilters.workMode.length > 0 ? selectedFilters.workMode as WorkMode[] : undefined,
      };

      const response = await opportunityService.listJobs(params);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load jobs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedFilters, toast]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (sectionId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[sectionId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return { ...prev, [sectionId]: updated };
    });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleClearAll = () => {
    setSelectedFilters({ jobType: [], workMode: [] });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold tracking-tight lg:text-4xl text-foreground">
          Explore Jobs
        </h1>
        <p className="text-muted-foreground">
          Find your next career opportunity from top companies.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block">
          <FilterSidebar 
            sections={FILTER_SECTIONS}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
            onSearchChange={setSearchQuery}
            searchQuery={searchQuery}
          />
        </aside>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Mobile Search & Filter Trigger could be added here */}

          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{data?.meta.total || 0}</span> jobs
            </p>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </motion.div>
            ) : data?.data.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Briefcase className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No jobs found</h3>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  We couldn't find any jobs matching your criteria. Try adjusting your filters.
                </p>
                <Button onClick={handleClearAll} variant="outline">
                  Clear All Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              >
                {data?.data.map((job) => (
                  <OpportunityCard key={job.id} item={job} type="job" />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {data && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                variant="outline"
                size="icon"
                disabled={!data.meta.hasPrevPage}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: data.meta.totalPages }).map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? 'default' : 'ghost'}
                    size="sm"
                    className="h-9 w-9"
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                disabled={!data.meta.hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
