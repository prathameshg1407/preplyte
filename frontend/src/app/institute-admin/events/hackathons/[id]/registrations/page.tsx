// src/app/institute-admin/events/hackathons/[id]/registrations/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { hackathonService } from '@/lib/api/services/hackathon.service';
import { EventApplicationsTable } from '@/components/institute-admin/events/EventApplicationsTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, Download } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

export default function HackathonRegistrationsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [hackathon, setHackathon] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hackathonData, regData] = await Promise.all([
          hackathonService.getHackathon(id as string),
          hackathonService.listRegistrations(id as string)
        ]);
        setHackathon(hackathonData);
        setRegistrations(regData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load registrations.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id, toast]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link 
            href="/institute-admin/events" 
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-2 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Events
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Registrations
            </h1>
            {hackathon && (
              <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700 border-amber-200">
                <Trophy className="h-3.5 w-3.5" />
                {hackathon.title}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Manage and review all participants for this hackathon.
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <EventApplicationsTable 
        items={registrations} 
        isLoading={loading} 
        type="hackathon" 
      />
    </div>
  );
}
