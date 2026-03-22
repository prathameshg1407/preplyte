// src/components/mock-drive/results/recommendations.tsx

'use client';

import { FC } from 'react';
import { CheckCircle2, AlertCircle, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationsProps {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallFeedback: string;
}

export const Recommendations: FC<RecommendationsProps> = ({
  strengths,
  weaknesses,
  recommendations,
  overallFeedback,
}) => {
  return (
    <div className="space-y-6">
      {/* Overall Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Overall Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{overallFeedback}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-2">
                {strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specific strengths identified.</p>
            )}
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weaknesses.length > 0 ? (
              <ul className="space-y-2">
                {weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No specific weaknesses identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length > 0 ? (
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border dark:border-blue-900/50">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No specific recommendations.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};