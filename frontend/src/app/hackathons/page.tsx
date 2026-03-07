// src/app/hackathons/page.tsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Hackathon, 
  HackathonStatus,
  HackathonMode,
  ParticipationType,
  PaginatedResponse 
} from '@/types/event.types';
import { hackathonService, HackathonListParams } from '@/lib/api/services/hackathon.service';
import { HackathonCard } from '@/components/hackathons/HackathonCard';
import { FilterSidebar, FilterSection } from '@/components/shared/FilterSidebar';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_SECTIONS: FilterSection[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'checkbox',
    options: [
      { label: 'Registration Open', value: HackathonStatus.REGISTRATION_OPEN },
      { label: 'Ongoing', value: HackathonStatus.ONGOING },
      { label: 'Completed', value: HackathonStatus.COMPLETED },
    ]
  },
  {
    id: 'mode',
    label: 'Mode',
    type: 'checkbox',
    options: [
      { label: 'Online', value: HackathonMode.ONLINE },
      { label: 'Offline', value: HackathonMode.OFFLINE },
      { label: 'Hybrid', value: HackathonMode.HYBRID },
    ]
  }
];

export default function HackathonsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaginatedResponse<Hackathon> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    status: [],
    mode: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const fetchHackathons = useCallback(async () => {
    try {
      setLoading(true);
      const params: HackathonListParams = {
        page: currentPage,
        limit: 9,
        search: searchQuery || undefined,
        status: selectedFilters.status.length > 0 ? selectedFilters.status as HackathonStatus[] : [HackathonStatus.PUBLISHED, HackathonStatus.REGISTRATION_OPEN, HackathonStatus.ONGOING],
        mode: selectedFilters.mode.length > 0 ? selectedFilters.mode as HackathonMode[] : undefined,
      };

      const response = await hackathonService.listHackathons(params);
      setData(response);
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hackathons. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedFilters, toast]);

  useEffect(() => {
    fetchHackathons();
  }, [fetchHackathons]);

  const handleFilterChange = (sectionId: string, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[sectionId] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return { ...prev, [sectionId]: updated };
    });
    setCurrentPage(1);
  };

  const handleClearAll = () => {
    setSelectedFilters({ status: [], mode: [] });
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
          Hackathons
        </h1>
        <p className="text-muted-foreground">
          Build, innovate, and compete for amazing prizes.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
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

        <div className="space-y-6">
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Showing <span className="font-medium text-foreground">{data?.meta.total || 0}</span> hackathons
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
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No hackathons found</h3>
                <p className="mb-6 max-w-sm text-muted-foreground">
                  Try adjusting your filters or search query.
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
                {data?.data.map((hackathon) => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

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
