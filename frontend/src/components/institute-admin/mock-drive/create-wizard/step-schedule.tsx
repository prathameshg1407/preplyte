// src/components/institute-admin/mock-drive/create-wizard/step-schedule.tsx

'use client';

import { useCallback, useMemo, type ChangeEvent } from 'react';
import { useCreateWizardStore } from '@/lib/store/institute-admin/mockdrive-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, Users, AlertCircle } from 'lucide-react';

// ============================================
// Date Conversion Utilities
// ============================================

/**
 * Convert ISO date string to local datetime-local input value
 */
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  
  // Convert to local "YYYY-MM-DDTHH:mm" format
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

/**
 * Convert local datetime-local input value to ISO string
 */
function localInputToIso(local: string): string | null {
  if (!local) return null;
  
  const date = new Date(local);
  if (isNaN(date.getTime())) return null;
  
  return date.toISOString();
}

/**
 * Get minimum datetime string for inputs (current time)
 */
function getMinDateTime(): string {
  const now = new Date();
  return isoToLocalInput(now.toISOString());
}

// ============================================
// Component
// ============================================

export function StepSchedule() {
  const schedule = useCreateWizardStore((state) => state.schedule);
  const setSchedule = useCreateWizardStore((state) => state.setSchedule);

  // Handlers
  const handleRegistrationStartChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSchedule({ registrationStartDate: localInputToIso(e.target.value) });
    },
    [setSchedule]
  );

  const handleRegistrationEndChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSchedule({ registrationEndDate: localInputToIso(e.target.value) });
    },
    [setSchedule]
  );

  const handleDriveStartChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSchedule({ driveStartDate: localInputToIso(e.target.value) });
    },
    [setSchedule]
  );

  const handleDriveEndChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSchedule({ driveEndDate: localInputToIso(e.target.value) });
    },
    [setSchedule]
  );

  const handleMaxRegistrationsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSchedule({
        maxRegistrations: value ? parseInt(value, 10) : null,
      });
    },
    [setSchedule]
  );

  // Validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    const {
      registrationStartDate,
      registrationEndDate,
      driveStartDate,
      driveEndDate,
    } = schedule;

    if (registrationStartDate && registrationEndDate) {
      const start = new Date(registrationStartDate);
      const end = new Date(registrationEndDate);
      if (start > end) {
        errors.push('Registration end date must be after start date');
      }
    }

    if (driveStartDate && driveEndDate) {
      const start = new Date(driveStartDate);
      const end = new Date(driveEndDate);
      if (start > end) {
        errors.push('Drive end date must be after start date');
      }
    }

    if (registrationEndDate && driveStartDate) {
      const regEnd = new Date(registrationEndDate);
      const driveStart = new Date(driveStartDate);
      if (regEnd > driveStart) {
        errors.push('Registration should end before the drive starts');
      }
    }

    return errors;
  }, [schedule]);

  // Input values
  const registrationStartValue = isoToLocalInput(schedule.registrationStartDate);
  const registrationEndValue = isoToLocalInput(schedule.registrationEndDate);
  const driveStartValue = isoToLocalInput(schedule.driveStartDate);
  const driveEndValue = isoToLocalInput(schedule.driveEndDate);
  const minDateTime = getMinDateTime();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Schedule</h2>
        <p className="text-sm text-muted-foreground">
          Set the registration and drive dates for your mock drive.
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-inside list-disc space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Date Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Registration Period */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              Registration Period
            </CardTitle>
            <CardDescription>
              When students can register for this mock drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registrationStartDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="registrationStartDate"
                type="datetime-local"
                value={registrationStartValue}
                onChange={handleRegistrationStartChange}
                min={minDateTime}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrationEndDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="registrationEndDate"
                type="datetime-local"
                value={registrationEndValue}
                onChange={handleRegistrationEndChange}
                min={registrationStartValue || minDateTime}
                aria-required="true"
              />
            </div>
          </CardContent>
        </Card>

        {/* Drive Period */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              Drive Period
            </CardTitle>
            <CardDescription>
              When the mock drive will be conducted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driveStartDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="driveStartDate"
                type="datetime-local"
                value={driveStartValue}
                onChange={handleDriveStartChange}
                min={registrationEndValue || minDateTime}
                aria-required="true"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driveEndDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="driveEndDate"
                type="datetime-local"
                value={driveEndValue}
                onChange={handleDriveEndChange}
                min={driveStartValue || minDateTime}
                aria-required="true"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Capacity
          </CardTitle>
          <CardDescription>
            Set a limit on how many students can register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="maxRegistrations">Maximum Registrations</Label>
            <Input
              id="maxRegistrations"
              type="number"
              placeholder="Leave empty for unlimited"
              value={schedule.maxRegistrations ?? ''}
              onChange={handleMaxRegistrationsChange}
              min={1}
              max={100000}
              aria-describedby="maxRegistrations-hint"
            />
            <p id="maxRegistrations-hint" className="text-xs text-muted-foreground">
              Leave empty to allow unlimited registrations
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}