// src/components/opportunities/OpportunityCard.tsx

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ArrowRight,
  IndianRupee,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Job, Internship, JobType } from '@/types/event.types';
import { formatDistanceToNow } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';

interface OpportunityCardProps {
  item: Job | Internship;
  type: 'job' | 'internship';
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ item, type }) => {
  const isJob = type === 'job';
  const job = item as Job;
  const internship = item as Internship;

  const deadline = new Date(item.applicationDeadline);
  const isExpired = deadline < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden border-2 transition-all duration-300 hover:border-primary/30 hover:shadow-xl dark:bg-card/50 dark:backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={isExpired ? 'destructive' : 'secondary'} className="capitalize">
                {isJob ? job.jobType.replace('_', ' ').toLowerCase() : 'Internship'}
              </Badge>
              {isJob && job.workMode && (
                <Badge variant="outline" className="capitalize">
                  {job.workMode.toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="line-clamp-1 text-xl font-bold tracking-tight group-hover:text-primary">
              {isJob ? job.roleTitle : internship.roleTitle}
            </h3>
            <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              {item.companyName}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">{isJob ? job.location : internship.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IndianRupee className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">
                {isJob 
                  ? `${formatCurrency(job.salaryMin || 0)} - ${formatCurrency(job.salaryMax || 0)} PA`
                  : `${formatCurrency(internship.stipendMin || 0)} - ${formatCurrency(internship.stipendMax || 0)} /mo`
                }
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2 text-sm">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className={cn(
              "font-medium",
              isExpired ? "text-destructive" : "text-muted-foreground"
            )}>
              {isExpired ? 'Application Closed' : `Ends ${formatDistanceToNow(deadline, { addSuffix: true })}`}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button asChild className="w-full gap-2 group" variant={isExpired ? 'outline' : 'default'}>
            <Link href={`/opportunities/${type}s/${item.id}`}>
              View Details
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
