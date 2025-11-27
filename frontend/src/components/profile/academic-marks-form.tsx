// src/components/profile/academic-marks-form.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';

export function AcademicMarksForm() {
  const { studentProfile, updateAcademicMarks, isUpdating } = useProfile();
  const [marks10, setMarks10] = useState<string>(studentProfile?.marks10?.toString() || '');
  const [marks12, setMarks12] = useState<string>(studentProfile?.marks12?.toString() || '');
  const [cgpaSemesters, setCgpaSemesters] = useState<string[]>(
    studentProfile?.cgpaSemesters?.map(String) || []
  );

  const handleAddSemester = () => {
    if (cgpaSemesters.length < 10) {
      setCgpaSemesters([...cgpaSemesters, '']);
    }
  };

  const handleRemoveSemester = (index: number) => {
    setCgpaSemesters(cgpaSemesters.filter((_, i) => i !== index));
  };

  const handleCgpaChange = (index: number, value: string) => {
    const updated = [...cgpaSemesters];
    updated[index] = value;
    setCgpaSemesters(updated);
  };

  const handleSave = async () => {
    try {
      await updateAcademicMarks({
        marks10: marks10 ? parseFloat(marks10) : undefined,
        marks12: marks12 ? parseFloat(marks12) : undefined,
        cgpaSemesters: cgpaSemesters
          .filter((c) => c !== '')
          .map((c) => parseFloat(c)),
      });
    } catch (error) {
      // Error handled by store
    }
  };

  const averageCgpa =
    cgpaSemesters.filter((c) => c !== '').length > 0
      ? (
          cgpaSemesters
            .filter((c) => c !== '')
            .reduce((sum, c) => sum + parseFloat(c || '0'), 0) /
          cgpaSemesters.filter((c) => c !== '').length
        ).toFixed(2)
      : null;

  if (!studentProfile) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Academic Marks</CardTitle>
        <CardDescription>
          Update your academic performance details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* School Marks */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marks10">10th Percentage</Label>
            <Input
              id="marks10"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="e.g., 85.5"
              value={marks10}
              onChange={(e) => setMarks10(e.target.value)}
              disabled={isUpdating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marks12">12th Percentage</Label>
            <Input
              id="marks12"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="e.g., 88.0"
              value={marks12}
              onChange={(e) => setMarks12(e.target.value)}
              disabled={isUpdating}
            />
          </div>
        </div>

        {/* Semester CGPAs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Semester CGPAs</Label>
            {averageCgpa && (
              <span className="text-sm text-muted-foreground">
                Average: <strong>{averageCgpa}</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {cgpaSemesters.map((cgpa, index) => (
              <div key={index} className="flex items-center gap-1">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  placeholder={`Sem ${index + 1}`}
                  value={cgpa}
                  onChange={(e) => handleCgpaChange(index, e.target.value)}
                  disabled={isUpdating}
                  className="text-center"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSemester(index)}
                  disabled={isUpdating}
                  className="shrink-0 h-8 w-8"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          {cgpaSemesters.length < 10 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSemester}
              disabled={isUpdating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Semester
            </Button>
          )}
        </div>

        <Button onClick={handleSave} disabled={isUpdating} className="w-full">
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Academic Marks'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}