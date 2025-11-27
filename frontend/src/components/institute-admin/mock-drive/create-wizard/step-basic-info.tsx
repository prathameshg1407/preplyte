// src/components/institute-admin/mock-drive/create-wizard/step-basic-info.tsx

'use client';

import { useCallback, type ChangeEvent } from 'react';
import { useCreateWizardStore } from '@/lib/store/institute-admin/mockdrive-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

// Constants
const TITLE_MAX_LENGTH = 200;
const TITLE_MIN_LENGTH = 3;
const DESCRIPTION_MAX_LENGTH = 5000;
const INSTRUCTIONS_MAX_LENGTH = 10000;

export function StepBasicInfo() {
  const basicInfo = useCreateWizardStore((state) => state.basicInfo);
  const setBasicInfo = useCreateWizardStore((state) => state.setBasicInfo);

  // Handlers
  const handleTitleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setBasicInfo({ title: e.target.value });
    },
    [setBasicInfo]
  );

  const handleDescriptionChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setBasicInfo({ description: e.target.value });
    },
    [setBasicInfo]
  );

  const handleInstructionsChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setBasicInfo({ instructions: e.target.value });
    },
    [setBasicInfo]
  );

  // Ensure values passed to inputs are always strings (never null)
  const titleValue = basicInfo.title;
  const descriptionValue = basicInfo.description ?? '';
  const instructionsValue = basicInfo.instructions ?? '';

  // Validation states
  const isTitleValid = titleValue.trim().length >= TITLE_MIN_LENGTH;
  const showTitleError = titleValue.length > 0 && !isTitleValid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <p className="text-sm text-muted-foreground">
          Provide the basic details for your mock drive.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Title Field */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Title
              <span className="text-destructive">*</span>
            </CardTitle>
            <CardDescription>
              Give your mock drive a clear, descriptive title
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              id="title"
              placeholder="e.g., Campus Placement Mock Drive 2024"
              value={titleValue}
              onChange={handleTitleChange}
              maxLength={TITLE_MAX_LENGTH}
              aria-describedby="title-hint title-error"
              aria-invalid={showTitleError}
              className={showTitleError ? 'border-destructive' : ''}
            />
            <div className="flex items-center justify-between">
              <p
                id="title-hint"
                className="text-xs text-muted-foreground"
              >
                {titleValue.length}/{TITLE_MAX_LENGTH} characters
                {titleValue.length > 0 && titleValue.length < TITLE_MIN_LENGTH && (
                  <span className="ml-2 text-destructive">
                    (minimum {TITLE_MIN_LENGTH} characters)
                  </span>
                )}
              </p>
              {showTitleError && (
                <p id="title-error" className="text-xs text-destructive">
                  Title must be at least {TITLE_MIN_LENGTH} characters
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description Field */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Description</CardTitle>
            <CardDescription>
              Describe the purpose and scope of this mock drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              id="description"
              placeholder="Describe the purpose and scope of this mock drive..."
              value={descriptionValue}
              onChange={handleDescriptionChange}
              rows={4}
              maxLength={DESCRIPTION_MAX_LENGTH}
              aria-describedby="description-hint"
            />
            <p id="description-hint" className="text-xs text-muted-foreground">
              {descriptionValue.length}/{DESCRIPTION_MAX_LENGTH} characters
            </p>
          </CardContent>
        </Card>

        {/* Instructions Field */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Instructions for Students</CardTitle>
            <CardDescription>
              Provide any special instructions for students participating in this mock drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              id="instructions"
              placeholder="Provide any special instructions for students participating in this mock drive..."
              value={instructionsValue}
              onChange={handleInstructionsChange}
              rows={4}
              maxLength={INSTRUCTIONS_MAX_LENGTH}
              aria-describedby="instructions-hint"
            />
            <p id="instructions-hint" className="text-xs text-muted-foreground">
              {instructionsValue.length}/{INSTRUCTIONS_MAX_LENGTH} characters
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}