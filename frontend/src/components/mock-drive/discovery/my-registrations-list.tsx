// src/components/mock-drive/discovery/my-registrations-list.tsx

'use client';

import { FC } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Building2,
  ChevronRight,
  PlayCircle,
  Eye,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MyRegistration, MockDriveStatus, MockDriveRegistrationStatus } from '@/types/mockdrive.types';
import {
  MOCKDRIVE_STATUS_CONFIG,
  REGISTRATION_STATUS_CONFIG,
} from '@/lib/constants/mockdrive.constants';

interface MyRegistrationsListProps {
  registrations: MyRegistration[];
  isLoading?: boolean;
}

export const MyRegistrationsList: FC<MyRegistrationsListProps> = ({
  registrations,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[300px] rounded-lg" />
        ))}
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No registrations found</p>
        <Link href="/mock-drive" className="mt-4 inline-block">
          <Button variant="outline">
            Browse Mock Drives
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {registrations.map((registration) => (
        <RegistrationCard key={registration.id} registration={registration} />
      ))}
    </div>
  );
};

interface RegistrationCardProps {
  registration: MyRegistration;
}

const RegistrationCard: FC<RegistrationCardProps> = ({ registration }) => {
  const { mockDrive, batch, status, registeredAt } = registration;
  const driveStatusConfig = MOCKDRIVE_STATUS_CONFIG[mockDrive.status];
  const regStatusConfig = REGISTRATION_STATUS_CONFIG[status];

  const canStart =
    status === MockDriveRegistrationStatus.APPROVED &&
    mockDrive.status === MockDriveStatus.IN_PROGRESS &&
    batch;

  const isCompleted = mockDrive.status === MockDriveStatus.COMPLETED;

  const getTimeUntilStart = () => {
    if (!batch) return null;
    const startTime = new Date(batch.scheduledStartTime);
    const now = new Date();
    if (startTime <= now) return null;

    const diffMs = startTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    }
    return `${diffHours}h`;
  };

  const timeUntilStart = getTimeUntilStart();

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg line-clamp-1">{mockDrive.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{mockDrive.institute.name}</span>
            </div>
          </div>
          <Badge className={`${regStatusConfig.bgColor} ${regStatusConfig.color} flex-shrink-0`}>
            {regStatusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Drive Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Drive Status</span>
          <Badge variant="outline" className={`${driveStatusConfig.color}`}>
            {driveStatusConfig.label}
          </Badge>
        </div>

        {/* Registration Date */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Registered on {format(new Date(registeredAt), 'MMM d, yyyy')}</span>
        </div>

        {/* Batch Info */}
        {batch && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{batch.name}</span>
              {timeUntilStart && (
                <Badge variant="secondary" className="text-xs">
                  Starts in {timeUntilStart}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(batch.scheduledStartTime), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
          </div>
        )}

        {/* Pending Approval Message */}
        {status === MockDriveRegistrationStatus.PENDING && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              Your registration is pending approval. You'll be notified once approved.
            </p>
          </div>
        )}

        {/* Rejected Message */}
        {status === MockDriveRegistrationStatus.REJECTED && (
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-red-800">
              Your registration was not approved. Contact your institute for more details.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 gap-2">
        {canStart && (
          <Link href={`/mock-drive/${mockDrive.id}/attempt`} className="flex-1">
            <Button className="w-full">
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Now
            </Button>
          </Link>
        )}

        {isCompleted && (
          <>
            <Link href={`/mock-drive/${mockDrive.id}/result`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Results
              </Button>
            </Link>
            <Link href={`/mock-drive/${mockDrive.id}/leaderboard`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Button>
            </Link>
          </>
        )}

        {!canStart && !isCompleted && (
          <Link href={`/mock-drive/${mockDrive.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Details
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};