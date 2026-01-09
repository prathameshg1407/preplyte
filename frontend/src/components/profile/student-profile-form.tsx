// src/components/profile/student-profile-form.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  User,
  Hash,
  GraduationCap,
  Calendar,
  Award,
  ChevronRight,
  Check,
  Sparkles,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useProfile, useDepartments } from '@/lib/hooks/use-profile';
import {
  createStudentProfileSchema,
  type CreateStudentProfileFormData,
} from '@/lib/validations/profile.schema';
import { COURSE_YEARS } from '@/types/profile.types';
import { cn } from '@/lib/utils';

interface StudentProfileFormProps {
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: User },
  { id: 'academic', title: 'Academic', icon: GraduationCap },
  { id: 'marks', title: 'Marks', icon: Award },
];

export function StudentProfileForm({ mode, onSuccess }: StudentProfileFormProps) {
  const {
    studentProfile,
    createStudentProfile,
    updateStudentProfile,
    isUpdating,
  } = useProfile();

  const { departments, isLoading: isDepartmentsLoading, error: departmentsError } = useDepartments();

  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<CreateStudentProfileFormData>({
    resolver: zodResolver(createStudentProfileSchema),
    defaultValues: {
      fullName: '',
      studentId: '',
      departmentId: '',
      courseYear: undefined,
      numberOfBacklogs: 0,
      skills: [],
      marks10: undefined,
      marks12: undefined,
      cgpaSemesters: [],
    },
    mode: 'onChange',
  });

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (mode === 'edit' && studentProfile) {
      reset({
        fullName: studentProfile.fullName,
        studentId: studentProfile.studentId,
        departmentId: studentProfile.departmentId,
        courseYear: studentProfile.courseYear as any,
        numberOfBacklogs: studentProfile.numberOfBacklogs,
        skills: studentProfile.skills,
        marks10: studentProfile.marks10 ?? undefined,
        marks12: studentProfile.marks12 ?? undefined,
        cgpaSemesters: studentProfile.cgpaSemesters,
      });
    }
  }, [mode, studentProfile, reset]);

  const watchedFields = watch();

  // Calculate completion percentage
  const calculateCompletion = () => {
    let filled = 0;
    const total = 4; // Required fields

    if (watchedFields.fullName) filled++;
    if (watchedFields.studentId) filled++;
    if (watchedFields.departmentId) filled++;
    if (watchedFields.courseYear) filled++;

    return Math.round((filled / total) * 100);
  };

  const completion = calculateCompletion();

  const onSubmit = async (data: CreateStudentProfileFormData) => {
    try {
      if (mode === 'create') {
        await createStudentProfile(data);
      } else {
        // Remove studentId from update data
        const { studentId, ...updateData } = data;
        await updateStudentProfile(updateData);
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onSuccess?.();
      }, 1500);
    } catch (error) {
      // Error handled by store
    }
  };

  const nextStep = async () => {
    const fieldsToValidate =
      currentStep === 0
        ? ['fullName', 'studentId']
        : currentStep === 1
          ? ['departmentId', 'courseYear']
          : [];

    const isValid = await trigger(fieldsToValidate as any);
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get selected department name for display
  const selectedDepartment = departments.find((d) => d.id === watchedFields.departmentId);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>
              {mode === 'create' ? 'Create Student Profile' : 'Edit Student Profile'}
            </CardTitle>
            <CardDescription>
              {mode === 'create'
                ? 'Fill in your academic details to get started'
                : 'Update your academic information'}
            </CardDescription>
          </div>

          {/* Completion Badge */}
          <div className="hidden sm:flex items-center gap-3 rounded-full bg-background px-4 py-2">
            <div className="relative h-8 w-8">
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-muted"
                />
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={75.4}
                  strokeDashoffset={75.4 - (75.4 * completion) / 100}
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {completion}%
              </span>
            </div>
            <span className="text-sm text-muted-foreground">Complete</span>
          </div>
        </div>
      </CardHeader>

      {/* Step Indicators */}
      {mode === 'create' && (
        <div className="border-b bg-muted/20 px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => index < currentStep && setCurrentStep(index)}
                    disabled={index > currentStep}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 transition-all',
                      isActive && 'bg-primary text-primary-foreground',
                      isCompleted && 'text-primary hover:bg-primary/10',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                        isActive && 'bg-primary-foreground/20',
                        isCompleted && 'bg-primary/20',
                        !isActive && !isCompleted && 'bg-muted'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/50" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Info */}
            {(mode === 'edit' || currentStep === 0) && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {mode === 'create' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Basic Information
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Let's start with your name and student ID
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-1">
                      Full Name
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        {...register('fullName')}
                        disabled={isUpdating}
                        className={cn(
                          'pl-10',
                          errors.fullName && 'border-destructive focus-visible:ring-destructive'
                        )}
                      />
                    </div>
                    {errors.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.fullName.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Student ID */}
                  <div className="space-y-2">
                    <Label htmlFor="studentId" className="flex items-center gap-1">
                      Student ID
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="studentId"
                        placeholder="e.g., STU2024001"
                        {...register('studentId')}
                        disabled={isUpdating || mode === 'edit'}
                        className={cn(
                          'pl-10',
                          errors.studentId && 'border-destructive focus-visible:ring-destructive',
                          mode === 'edit' && 'bg-muted cursor-not-allowed'
                        )}
                      />
                    </div>
                    {errors.studentId && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.studentId.message}
                      </motion.p>
                    )}
                    {mode === 'edit' && (
                      <p className="text-xs text-muted-foreground">Student ID cannot be changed</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Academic Info */}
            {(mode === 'edit' || currentStep === 1) && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {mode === 'create' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Academic Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tell us about your course and department
                    </p>
                  </div>
                )}

                {/* Department Error Alert */}
                {departmentsError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load departments. Please refresh the page.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Department */}
                  <div className="space-y-2">
                    <Label htmlFor="departmentId" className="flex items-center gap-1">
                      Department
                      <span className="text-destructive">*</span>
                    </Label>
                    {isDepartmentsLoading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Select
                        value={watchedFields.departmentId}
                        onValueChange={(value) =>
                          setValue('departmentId', value, { shouldValidate: true })
                        }
                        disabled={isUpdating || departments.length === 0}
                      >
                        <SelectTrigger
                          className={cn(
                            errors.departmentId && 'border-destructive focus:ring-destructive'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Select your department" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {departments.length === 0 ? (
                            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                              No departments available
                            </div>
                          ) : (
                            departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                <div className="flex items-center gap-2">
                                  {dept.code && (
                                    <span className="font-medium text-primary">{dept.code}</span>
                                  )}
                                  <span>{dept.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.departmentId && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.departmentId.message}
                      </motion.p>
                    )}
                    {selectedDepartment?.description && (
                      <p className="text-xs text-muted-foreground">
                        {selectedDepartment.description}
                      </p>
                    )}
                  </div>

                  {/* Course Year */}
                  <div className="space-y-2">
                    <Label htmlFor="courseYear" className="flex items-center gap-1">
                      Course Year
                      <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watchedFields.courseYear}
                      onValueChange={(value) =>
                        setValue('courseYear', value as any, { shouldValidate: true })
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger
                        className={cn(
                          errors.courseYear && 'border-destructive focus:ring-destructive'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Select your year" />
                        </div>
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
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.courseYear.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Number of Backlogs */}
                <div className="space-y-2">
                  <Label htmlFor="numberOfBacklogs">Number of Backlogs</Label>
                  <div className="relative max-w-xs">
                    <Input
                      id="numberOfBacklogs"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="0"
                      {...register('numberOfBacklogs', { valueAsNumber: true })}
                      disabled={isUpdating}
                      className={cn(
                        '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]',
                        errors.numberOfBacklogs && 'border-destructive focus-visible:ring-destructive'
                      )}
                    />
                  </div>
                  {errors.numberOfBacklogs && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      {errors.numberOfBacklogs.message}
                    </motion.p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter the total number of subjects you have backlogs in
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Marks (Optional) */}
            {(mode === 'edit' || currentStep === 2) && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {mode === 'create' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Academic Marks
                      <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Add your academic scores to improve profile visibility
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 10th Marks */}
                  <div className="space-y-2">
                    <Label htmlFor="marks10">10th Percentage</Label>
                    <div className="relative">
                      <Input
                        id="marks10"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="e.g., 85.5"
                        {...register('marks10', { valueAsNumber: true })}
                        disabled={isUpdating}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                    {errors.marks10 && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.marks10.message}
                      </motion.p>
                    )}
                  </div>

                  {/* 12th Marks */}
                  <div className="space-y-2">
                    <Label htmlFor="marks12">12th Percentage</Label>
                    <div className="relative">
                      <Input
                        id="marks12"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="e.g., 88.0"
                        {...register('marks12', { valueAsNumber: true })}
                        disabled={isUpdating}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                    {errors.marks12 && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive"
                      >
                        {errors.marks12.message}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            {mode === 'create' ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isUpdating}
                >
                  Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button type="button" onClick={nextStep} disabled={isUpdating}>
                    Continue
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isUpdating} className="gap-2">
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : showSuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        Created!
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Create Profile
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Button type="submit" disabled={isUpdating} className="ml-auto gap-2">
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : showSuccess ? (
                  <>
                    <Check className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}