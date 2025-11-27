// src/components/profile/student-profile-form.tsx

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useProfile } from '@/lib/hooks/use-profile';
import {
  createStudentProfileSchema,
  type CreateStudentProfileFormData,
} from '@/lib/validations/profile.schema';
import { DEPARTMENTS, COURSE_YEARS } from '@/types/profile.types';

interface StudentProfileFormProps {
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

export function StudentProfileForm({ mode, onSuccess }: StudentProfileFormProps) {
  const {
    studentProfile,
    createStudentProfile,
    updateStudentProfile,
    isUpdating,
  } = useProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<CreateStudentProfileFormData>({
    resolver: zodResolver(createStudentProfileSchema),
    defaultValues: {
      fullName: '',
      studentId: '',
      department: undefined,
      courseYear: undefined,
      skills: [],
      marks10: undefined,
      marks12: undefined,
      cgpaSemesters: [],
    },
  });

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && studentProfile) {
      reset({
        fullName: studentProfile.fullName,
        studentId: studentProfile.studentId,
        department: studentProfile.department as any,
        courseYear: studentProfile.courseYear as any,
        skills: studentProfile.skills,
        marks10: studentProfile.marks10 ?? undefined,
        marks12: studentProfile.marks12 ?? undefined,
        cgpaSemesters: studentProfile.cgpaSemesters,
      });
    }
  }, [mode, studentProfile, reset]);

  const onSubmit = async (data: CreateStudentProfileFormData) => {
    try {
      if (mode === 'create') {
        await createStudentProfile(data);
      } else {
        await updateStudentProfile(data);
      }
      onSuccess?.();
    } catch (error) {
      // Error handled by store
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create' : 'Edit'} Student Profile</CardTitle>
        <CardDescription>
          {mode === 'create'
            ? 'Fill in your academic details to complete your profile'
            : 'Update your academic information'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                {...register('fullName')}
                disabled={isUpdating}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            {/* Student ID */}
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                placeholder="e.g., STU2024001"
                {...register('studentId')}
                disabled={isUpdating || mode === 'edit'}
              />
              {errors.studentId && (
                <p className="text-sm text-destructive">{errors.studentId.message}</p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={watch('department')}
                onValueChange={(value) => setValue('department', value as any)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-destructive">{errors.department.message}</p>
              )}
            </div>

            {/* Course Year */}
            <div className="space-y-2">
              <Label htmlFor="courseYear">Course Year *</Label>
              <Select
                value={watch('courseYear')}
                onValueChange={(value) => setValue('courseYear', value as any)}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {COURSE_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseYear && (
                <p className="text-sm text-destructive">{errors.courseYear.message}</p>
              )}
            </div>

            {/* 10th Marks */}
            <div className="space-y-2">
              <Label htmlFor="marks10">10th Percentage</Label>
              <Input
                id="marks10"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g., 85.5"
                {...register('marks10', { valueAsNumber: true })}
                disabled={isUpdating}
              />
              {errors.marks10 && (
                <p className="text-sm text-destructive">{errors.marks10.message}</p>
              )}
            </div>

            {/* 12th Marks */}
            <div className="space-y-2">
              <Label htmlFor="marks12">12th Percentage</Label>
              <Input
                id="marks12"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="e.g., 88.0"
                {...register('marks12', { valueAsNumber: true })}
                disabled={isUpdating}
              />
              {errors.marks12 && (
                <p className="text-sm text-destructive">{errors.marks12.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isUpdating} className="w-full">
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Saving...'}
              </>
            ) : mode === 'create' ? (
              'Create Profile'
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}