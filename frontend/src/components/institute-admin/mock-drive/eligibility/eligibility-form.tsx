// src/components/institute-admin/mock-drive/eligibility/eligibility-form.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  EligibilityCriteria,
  SetEligibilityInput,
} from '@/types/admin.mockdrive.types';
import {
  DEPARTMENT_OPTIONS,
  COURSE_YEAR_OPTIONS,
  SKILL_OPTIONS,
  VALIDATION,
} from '@/lib/constants/admin.mockdrive.constants';
import {
  GraduationCap,
  BookOpen,
  Building2,
  Calendar,
  Sparkles,
  Loader2,
  Plus,
  X,
  Save,
} from 'lucide-react';

// ============================================
// Form Schema
// ============================================

const formSchema = z.object({
  minCgpa: z.number().min(0).max(10).nullable(),
  maxCgpa: z.number().min(0).max(10).nullable(),
  minMarks10: z.number().min(0).max(100).nullable(),
  minMarks12: z.number().min(0).max(100).nullable(),
  maxBacklogs: z.number().min(0).max(20).nullable(),
  allowedDepartments: z.array(z.string()),
  allowedCourseYears: z.array(z.string()),
  requiredSkills: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

// ============================================
// Props
// ============================================

interface EligibilityFormProps {
  criteria: EligibilityCriteria | null | undefined;
  onSubmit: (data: SetEligibilityInput) => Promise<void>;
  isSubmitting?: boolean;
}

// ============================================
// Component
// ============================================

export function EligibilityForm({
  criteria,
  onSubmit,
  isSubmitting,
}: EligibilityFormProps) {
  const [newDepartment, setNewDepartment] = useState('');
  const [newCourseYear, setNewCourseYear] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minCgpa: null,
      maxCgpa: null,
      minMarks10: null,
      minMarks12: null,
      maxBacklogs: null,
      allowedDepartments: [],
      allowedCourseYears: [],
      requiredSkills: [],
    },
  });

  // Reset form when criteria changes
  useEffect(() => {
    if (criteria) {
      form.reset({
        minCgpa: criteria.minCgpa,
        maxCgpa: criteria.maxCgpa,
        minMarks10: criteria.minMarks10,
        minMarks12: criteria.minMarks12,
        maxBacklogs: criteria.maxBacklogs,
        allowedDepartments: criteria.allowedDepartments || [],
        allowedCourseYears: criteria.allowedCourseYears || [],
        requiredSkills: criteria.requiredSkills || [],
      });
    }
  }, [criteria, form]);

  const handleSubmit = async (values: FormValues) => {
    await onSubmit({
      minCgpa: values.minCgpa,
      maxCgpa: values.maxCgpa,
      minMarks10: values.minMarks10,
      minMarks12: values.minMarks12,
      maxBacklogs: values.maxBacklogs,
      allowedDepartments: values.allowedDepartments,
      allowedCourseYears: values.allowedCourseYears,
      requiredSkills: values.requiredSkills,
    });
  };

  // Array field helpers
  const addToArray = useCallback(
    (fieldName: 'allowedDepartments' | 'allowedCourseYears' | 'requiredSkills', value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      const currentValues = form.getValues(fieldName);
      if (!currentValues.includes(trimmed)) {
        form.setValue(fieldName, [...currentValues, trimmed]);
      }
    },
    [form]
  );

  const removeFromArray = useCallback(
    (fieldName: 'allowedDepartments' | 'allowedCourseYears' | 'requiredSkills', value: string) => {
      const currentValues = form.getValues(fieldName);
      form.setValue(
        fieldName,
        currentValues.filter((v) => v !== value)
      );
    },
    [form]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* CGPA Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4" />
              CGPA Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="minCgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum CGPA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={10}
                        placeholder="e.g., 6.0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormDescription>Leave empty for no minimum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxCgpa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum CGPA</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        max={10}
                        placeholder="e.g., 10.0"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormDescription>Leave empty for no maximum</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Marks Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="h-4 w-4" />
              Academic Marks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="minMarks10"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum 10th Marks (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="e.g., 60"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minMarks12"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum 12th Marks (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="e.g., 60"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backlogs Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Backlog Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="maxBacklogs"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Maximum Allowed Backlogs</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      placeholder="e.g., 0"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Students with more backlogs will be ineligible
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Departments Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Allowed Departments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="allowedDepartments"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add department..."
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('allowedDepartments', newDepartment);
                          setNewDepartment('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        addToArray('allowedDepartments', newDepartment);
                        setNewDepartment('');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Add Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {DEPARTMENT_OPTIONS.filter(
                      (d) => !field.value.includes(d)
                    ).map((dept) => (
                      <Button
                        key={dept}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => addToArray('allowedDepartments', dept)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {dept}
                      </Button>
                    ))}
                  </div>

                  {/* Selected Departments */}
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((dept) => (
                        <Badge key={dept} variant="secondary" className="gap-1 pr-1">
                          {dept}
                          <button
                            type="button"
                            onClick={() => removeFromArray('allowedDepartments', dept)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <FormDescription>
                    Leave empty to allow all departments
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Course Years Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Allowed Course Years
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="allowedCourseYears"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add course year..."
                      value={newCourseYear}
                      onChange={(e) => setNewCourseYear(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('allowedCourseYears', newCourseYear);
                          setNewCourseYear('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        addToArray('allowedCourseYears', newCourseYear);
                        setNewCourseYear('');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Add Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {COURSE_YEAR_OPTIONS.filter(
                      (y) => !field.value.includes(y)
                    ).map((year) => (
                      <Button
                        key={year}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => addToArray('allowedCourseYears', year)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {year}
                      </Button>
                    ))}
                  </div>

                  {/* Selected Years */}
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((year) => (
                        <Badge key={year} variant="secondary" className="gap-1 pr-1">
                          {year}
                          <button
                            type="button"
                            onClick={() => removeFromArray('allowedCourseYears', year)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <FormDescription>
                    Leave empty to allow all course years
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Required Skills Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" />
              Required Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="requiredSkills"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add skill..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addToArray('requiredSkills', newSkill);
                          setNewSkill('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        addToArray('requiredSkills', newSkill);
                        setNewSkill('');
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Add Buttons */}
                  <div className="flex flex-wrap gap-1">
                    {SKILL_OPTIONS.filter((s) => !field.value.includes(s))
                      .slice(0, 10)
                      .map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => addToArray('requiredSkills', skill)}
                        >
                          <Plus className="mr-1 h-3 w-3" />
                          {skill}
                        </Button>
                      ))}
                  </div>

                  {/* Selected Skills */}
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((skill) => (
                        <Badge key={skill} variant="outline" className="gap-1 pr-1">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeFromArray('requiredSkills', skill)}
                            className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <FormDescription>
                    Students must have at least one of these skills to be eligible
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Criteria
          </Button>
        </div>
      </form>
    </Form>
  );
}