'use client';

import { useEffect, useState } from 'react';
import { resumeBuilderService } from '@/lib/api/services/resume-builder.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function TestPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        setError(null);
        const data = await resumeBuilderService.getTemplates();
        console.log('Templates fetched:', data);
        setTemplates(data);
      } catch (err: any) {
        console.error('Error fetching templates:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch templates');
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Resume Builder API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading templates...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && (
            <div>
              <p className="mb-4">
                <strong>Templates found:</strong> {templates.length}
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(templates, null, 2)}
              </pre>
            </div>
          )}

          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </CardContent>
      </Card>
    </div>
  );
}
