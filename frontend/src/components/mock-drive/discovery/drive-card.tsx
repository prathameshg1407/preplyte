// src/components/mock-drive/discovery/drive-card.tsx

'use client';

import { FC } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, Users, ChevronRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MockDriveListItem } from '@/types/mockdrive.types';
import { MOCKDRIVE_STATUS_CONFIG, REGISTRATION_STATUS_CONFIG } from '@/lib/constants/mockdrive.constants';

interface DriveCardProps {
  drive: MockDriveListItem;
}

export const DriveCard: FC<DriveCardProps> = ({ drive }) => {
  const statusConfig = MOCKDRIVE_STATUS_CONFIG[drive.status];
  const registrationConfig = drive.registrationStatus
    ? REGISTRATION_STATUS_CONFIG[drive.registrationStatus]
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1">{drive.title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{drive.institute.name}</span>
            </div>
          </div>
          <Badge className={`${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {drive.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{drive.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          {drive.driveStartDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(drive.driveStartDate), 'MMM d, yyyy')}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{drive.moduleCount} modules</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{drive.registrationCount} registered</span>
          </div>
        </div>

        {/* Registration Status */}
        {drive.isRegistered && registrationConfig && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Registration Status:</span>
              <Badge variant="outline" className={`${registrationConfig.bgColor} ${registrationConfig.color}`}>
                {registrationConfig.label}
              </Badge>
            </div>
            {drive.batchInfo && (
              <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                <p className="font-medium">{drive.batchInfo.name}</p>
                <p className="text-muted-foreground">
                  {format(new Date(drive.batchInfo.scheduledStartTime), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/mock-drive/${drive.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};