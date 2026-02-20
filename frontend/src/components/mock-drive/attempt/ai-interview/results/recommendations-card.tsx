// src/components/practice/ai-interview/results/recommendations-card.tsx

'use client';

import { Lightbulb, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationsCardProps {
  recommendations: string[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-3">
              <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <span className="text-sm">{recommendation}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}