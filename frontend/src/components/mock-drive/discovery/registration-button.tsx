// src/components/mock-drive/discovery/registration-button.tsx (fixed)

'use client';

import { FC, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useRegister, useWithdrawRegistration } from '@/lib/hooks/mock-drive/use-discovery';
import { MockDriveRegistrationStatus } from '@/types/mockdrive.types';

interface RegistrationButtonProps {
  driveId: string;
  isRegistered: boolean;
  registrationStatus: MockDriveRegistrationStatus | null;
  canRegister: boolean;
}

export const RegistrationButton: FC<RegistrationButtonProps> = ({
  driveId,
  isRegistered,
  registrationStatus,
  canRegister,
}) => {
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  
  const registerMutation = useRegister();
  const withdrawMutation = useWithdrawRegistration();

  const handleRegister = () => {
    registerMutation.mutate(driveId);
  };

  const handleWithdraw = () => {
    withdrawMutation.mutate(driveId, {
      onSuccess: () => setShowWithdrawDialog(false),
    });
  };

  if (isRegistered) {
    const canWithdraw = 
      registrationStatus === MockDriveRegistrationStatus.PENDING || 
      registrationStatus === MockDriveRegistrationStatus.APPROVED;
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          {registrationStatus === MockDriveRegistrationStatus.APPROVED ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : registrationStatus === MockDriveRegistrationStatus.REJECTED ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : null}
          <span>
            {registrationStatus === MockDriveRegistrationStatus.PENDING && 'Registration pending approval'}
            {registrationStatus === MockDriveRegistrationStatus.APPROVED && 'Registered'}
            {registrationStatus === MockDriveRegistrationStatus.REJECTED && 'Registration rejected'}
            {registrationStatus === MockDriveRegistrationStatus.WITHDRAWN && 'Registration withdrawn'}
          </span>
        </div>
        
        {canWithdraw && (
          <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                Withdraw
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Withdraw Registration?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to withdraw your registration? You may need to register again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Withdraw
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleRegister}
      disabled={!canRegister || registerMutation.isPending}
    >
      {registerMutation.isPending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      Register Now
    </Button>
  );
};