// src/components/mock-drive/discovery/eligibility-status.tsx

'use client';

import { FC } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EligibilityCheckResponse } from '@/types/mockdrive.types';

interface EligibilityStatusProps {
  data: EligibilityCheckResponse | undefined;
  isLoading: boolean;
}

export const EligibilityStatus: FC<EligibilityStatusProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Checking eligibility...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { eligibility, canRegister, reason } = data;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {eligibility.isEligible ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          Eligibility Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <span className="font-medium">Overall Eligibility</span>
          <Badge variant={eligibility.isEligible ? 'default' : 'destructive'}>
            {eligibility.isEligible ? 'Eligible' : 'Not Eligible'}
          </Badge>
        </div>

        {/* Individual Checks */}
        <div className="space-y-2">
          {eligibility.checks.map((check, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-2 rounded-md ${
                check.passed ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {check.passed ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{check.criterion}</p>
                <p className="text-xs text-muted-foreground">{check.details}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Registration Message */}
        {!canRegister && reason && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">{reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};