// src/components/profile/academic-marks-form.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Loader2,
  Plus,
  Trash2,
  GraduationCap,
  TrendingUp,
  Award,
  Sparkles,
  Check,
  Info,
} from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import { cn } from '@/lib/utils';

export function AcademicMarksForm() {
  const { studentProfile, updateAcademicMarks, isUpdating } = useProfile();
  const [marks10, setMarks10] = useState<string>(studentProfile?.marks10?.toString() || '');
  const [marks12, setMarks12] = useState<string>(studentProfile?.marks12?.toString() || '');
  const [cgpaSemesters, setCgpaSemesters] = useState<string[]>(
    studentProfile?.cgpaSemesters?.map(String) || []
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Track changes
  useEffect(() => {
    const original10 = studentProfile?.marks10?.toString() || '';
    const original12 = studentProfile?.marks12?.toString() || '';
    const originalCgpa = studentProfile?.cgpaSemesters?.map(String) || [];

    const changed =
      marks10 !== original10 ||
      marks12 !== original12 ||
      JSON.stringify(cgpaSemesters) !== JSON.stringify(originalCgpa);

    setHasChanges(changed);
  }, [marks10, marks12, cgpaSemesters, studentProfile]);

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
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      // Error handled by store
    }
  };

  const validCgpas = cgpaSemesters.filter((c) => c !== '' && !isNaN(parseFloat(c)));
  const averageCgpa =
    validCgpas.length > 0
      ? (validCgpas.reduce((sum, c) => sum + parseFloat(c), 0) / validCgpas.length).toFixed(2)
      : null;

  const getGradeColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return 'text-emerald-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getCgpaColor = (cgpa: number) => {
    if (cgpa >= 8) return 'bg-emerald-500';
    if (cgpa >= 6) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (!studentProfile) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Academic Performance</CardTitle>
              <CardDescription>Track your academic journey</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* School Performance Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">School Performance</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 10th Marks */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="group relative rounded-xl border-2 border-transparent bg-muted/50 p-4 transition-all hover:border-primary/20 hover:bg-muted/70"
              >
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="marks10" className="text-sm font-medium">
                    10th Standard
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter your 10th board examination percentage
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="marks10"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={marks10}
                    onChange={(e) => setMarks10(e.target.value)}
                    disabled={isUpdating}
                    className="h-12 text-lg font-semibold pr-12 bg-background"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    %
                  </span>
                </div>
                {marks10 && !isNaN(parseFloat(marks10)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full', getCgpaColor(parseFloat(marks10) / 10))}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(parseFloat(marks10), 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* 12th Marks */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="group relative rounded-xl border-2 border-transparent bg-muted/50 p-4 transition-all hover:border-primary/20 hover:bg-muted/70"
              >
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="marks12" className="text-sm font-medium">
                    12th Standard
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter your 12th board examination percentage
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="marks12"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="Enter percentage"
                    value={marks12}
                    onChange={(e) => setMarks12(e.target.value)}
                    disabled={isUpdating}
                    className="h-12 text-lg font-semibold pr-12 bg-background"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    %
                  </span>
                </div>
                {marks12 && !isNaN(parseFloat(marks12)) && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn('h-full rounded-full', getCgpaColor(parseFloat(marks12) / 10))}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(parseFloat(marks12), 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>

          {/* Semester CGPAs Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Semester CGPAs</h3>
              </div>

              {averageCgpa && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-muted-foreground">
                    Average:{' '}
                    <span className={cn('font-bold text-base', getGradeColor(parseFloat(averageCgpa), 10))}>
                      {averageCgpa}
                    </span>
                  </span>
                </motion.div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <AnimatePresence mode="popLayout">
                {cgpaSemesters.map((cgpa, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative"
                  >
                    <div className="relative rounded-xl border-2 border-transparent bg-muted/50 p-3 transition-all hover:border-primary/20">
                      <span className="absolute -top-2 left-3 bg-background px-1.5 text-xs font-medium text-muted-foreground">
                        Sem {index + 1}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        placeholder="0.00"
                        value={cgpa}
                        onChange={(e) => handleCgpaChange(index, e.target.value)}
                        disabled={isUpdating}
                        className="h-10 text-center font-semibold text-lg bg-transparent border-0 focus-visible:ring-0 p-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSemester(index)}
                        disabled={isUpdating}
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add Semester Button */}
              {cgpaSemesters.length < 10 && (
                <motion.button
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddSemester}
                  disabled={isUpdating}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-muted-foreground/30 p-3 text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs font-medium">Add</span>
                </motion.button>
              )}
            </div>

            {cgpaSemesters.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No semester CGPAs added yet. Click "Add" to start tracking.
              </p>
            )}
          </section>

          {/* Save Button */}
          <div className="flex items-center justify-between pt-4 border-t">
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-2 text-emerald-600"
                >
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Saved successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleSave}
              disabled={isUpdating || !hasChanges}
              className="ml-auto gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}