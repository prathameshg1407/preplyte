// src/components/institute-admin/mock-drive/create-wizard/step-settings.tsx

'use client';

import { useCallback } from 'react';
import { useCreateWizardStore } from '@/lib/store/institute-admin/mockdrive-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Eye,
  Trophy,
  Shuffle,
  Shield,
  Clock,
  MonitorX,
  Copy,
  Camera,
  Monitor,
  AlertTriangle,
  MousePointer2,
  FileText,
  Zap,
} from 'lucide-react';

// ============================================
// Helper Components
// ============================================

interface SettingRowProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

function SettingRow({
  id,
  icon,
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
        <div className="space-y-1">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {title}
          </Label>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

// ============================================
// Date Input Helper
// ============================================

function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function localInputToIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

// ============================================
// Main Component
// ============================================

export function StepSettings() {
  const settings = useCreateWizardStore((state) => state.settings);
  const setSettings = useCreateWizardStore((state) => state.setSettings);

  // Display Settings Handlers
  const handleShowLeaderboardChange = useCallback(
    (checked: boolean) => {
      setSettings({ showLeaderboard: checked });
    },
    [setSettings]
  );

  const handleShowResultsImmediatelyChange = useCallback(
    (checked: boolean) => {
      setSettings({ showResultsImmediately: checked });
    },
    [setSettings]
  );

  const handleResultsReleaseDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings({ resultsReleaseDate: localInputToIso(e.target.value) });
    },
    [setSettings]
  );

  // Test Settings Handlers
  const handleShuffleQuestionsChange = useCallback(
    (checked: boolean) => {
      setSettings({ shuffleQuestions: checked });
    },
    [setSettings]
  );

  const handleAllowLateSubmissionChange = useCallback(
    (checked: boolean) => {
      setSettings({ allowLateSubmission: checked });
    },
    [setSettings]
  );

  // Proctoring Settings Handlers
  const handleEnableProctoringChange = useCallback(
    (checked: boolean) => {
      setSettings({ enableProctoring: checked });
    },
    [setSettings]
  );

  const handleProctoringSettingChange = useCallback(
    (key: keyof typeof settings.proctoringSettings, value: boolean | number) => {
      setSettings({
        proctoringSettings: {
          ...settings.proctoringSettings,
          [key]: value,
        },
      });
    },
    [settings.proctoringSettings, setSettings]
  );

  const handleMaxTabSwitchesChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0) {
        handleProctoringSettingChange('maxTabSwitches', Math.min(value, 100));
      }
    },
    [handleProctoringSettingChange]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure display options, test behavior, and proctoring settings.
        </p>
      </div>

      {/* Display Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-4 w-4" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Control what students can see during and after the mock drive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            id="showLeaderboard"
            icon={<Trophy className="h-4 w-4" />}
            title="Show Leaderboard"
            description="Display rankings to students after completion"
            checked={settings.showLeaderboard}
            onCheckedChange={handleShowLeaderboardChange}
          />

          <SettingRow
            id="showResultsImmediately"
            icon={<Eye className="h-4 w-4" />}
            title="Show Results Immediately"
            description="Students can view their results right after submission"
            checked={settings.showResultsImmediately}
            onCheckedChange={handleShowResultsImmediatelyChange}
          />

          {/* Results Release Date - only shown if not immediate */}
          {!settings.showResultsImmediately && (
            <div className="ml-7 space-y-2 rounded-lg border bg-muted/30 p-4">
              <Label htmlFor="resultsReleaseDate" className="text-sm">
                Results Release Date
              </Label>
              <Input
                id="resultsReleaseDate"
                type="datetime-local"
                value={isoToLocalInput(settings.resultsReleaseDate)}
                onChange={handleResultsReleaseDateChange}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to release results manually
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Test Settings</CardTitle>
          <CardDescription>Configure how the test behaves</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            id="shuffleQuestions"
            icon={<Shuffle className="h-4 w-4" />}
            title="Shuffle Questions"
            description="Randomize question order for each student"
            checked={settings.shuffleQuestions}
            onCheckedChange={handleShuffleQuestionsChange}
          />

          <SettingRow
            id="allowLateSubmission"
            icon={<Clock className="h-4 w-4" />}
            title="Allow Late Submission"
            description="Accept submissions after the time limit (with penalty)"
            checked={settings.allowLateSubmission}
            onCheckedChange={handleAllowLateSubmissionChange}
          />
        </CardContent>
      </Card>

      {/* Proctoring Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Proctoring Settings
          </CardTitle>
          <CardDescription>
            Enable monitoring to prevent cheating during the test
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enable Proctoring Toggle */}
          <SettingRow
            id="enableProctoring"
            icon={<Shield className="h-4 w-4" />}
            title="Enable Proctoring"
            description="Monitor student activity during the test"
            checked={settings.enableProctoring}
            onCheckedChange={handleEnableProctoringChange}
          />

          {/* Proctoring Options - only shown when proctoring is enabled */}
          {settings.enableProctoring && (
            <div className="ml-7 space-y-4 rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-medium">Proctoring Options</h4>

              <Separator />

              {/* Tab Switch Detection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <MonitorX className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <Label
                        htmlFor="detectTabSwitch"
                        className="text-sm font-medium cursor-pointer"
                      >
                        Detect Tab Switching
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Track when students switch to other tabs or windows
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="detectTabSwitch"
                    checked={settings.proctoringSettings.detectTabSwitch}
                    onCheckedChange={(checked) =>
                      handleProctoringSettingChange('detectTabSwitch', checked)
                    }
                  />
                </div>

                {settings.proctoringSettings.detectTabSwitch && (
                  <div className="ml-7 space-y-2">
                    <Label htmlFor="maxTabSwitches" className="text-xs">
                      Maximum Allowed Tab Switches
                    </Label>
                    <Input
                      id="maxTabSwitches"
                      type="number"
                      min={1}
                      max={10}
                      value={settings.proctoringSettings.maxTabSwitches}
                      onChange={handleMaxTabSwitchesChange}
                      className="w-24"
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Fullscreen Requirement */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Monitor className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label
                      htmlFor="requireFullscreen"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Require Fullscreen
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Force fullscreen mode during the test
                    </p>
                  </div>
                </div>
                <Switch
                  id="requireFullscreen"
                  checked={settings.proctoringSettings.requireFullscreen}
                  onCheckedChange={(checked) =>
                    handleProctoringSettingChange('requireFullscreen', checked)
                  }
                />
              </div>

              <Separator />

              {/* Copy/Paste Detection */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Copy className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label
                      htmlFor="detectCopyPaste"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Detect Copy/Paste
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Track copy and paste actions
                    </p>
                  </div>
                </div>
                <Switch
                  id="detectCopyPaste"
                  checked={settings.proctoringSettings.detectCopyPaste}
                  onCheckedChange={(checked) =>
                    handleProctoringSettingChange('detectCopyPaste', checked)
                  }
                />
              </div>

              <Separator />

              {/* Right Click Restriction */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <MousePointer2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label
                      htmlFor="rightClickDisabled"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Disable Right Click
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Prevent students from opening context menus
                    </p>
                  </div>
                </div>
                <Switch
                  id="rightClickDisabled"
                  checked={settings.proctoringSettings.rightClickDisabled}
                  onCheckedChange={(checked) =>
                    handleProctoringSettingChange('rightClickDisabled', checked)
                  }
                />
              </div>

              <Separator />

              {/* Text Selection Restriction */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label
                      htmlFor="textSelectionDisabled"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Disable Text Selection
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Prevent students from selecting and copying text
                    </p>
                  </div>
                </div>
                <Switch
                  id="textSelectionDisabled"
                  checked={settings.proctoringSettings.textSelectionDisabled}
                  onCheckedChange={(checked) =>
                    handleProctoringSettingChange('textSelectionDisabled', checked)
                  }
                />
              </div>

              <Separator />

              {/* Auto Submit on Violation */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Zap className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label
                      htmlFor="autoSubmitOnViolation"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Immediate Submission
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically submit the test on the first violation
                    </p>
                  </div>
                </div>
                <Switch
                  id="autoSubmitOnViolation"
                  checked={settings.proctoringSettings.autoSubmitOnViolation}
                  onCheckedChange={(checked) =>
                    handleProctoringSettingChange('autoSubmitOnViolation', checked)
                  }
                />
              </div>

              <Separator />

              {/* Webcam Requirement */}
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Camera className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <Label
                      htmlFor="webcamRequired"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Require Webcam
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Students must have webcam enabled before starting
                    </p>
                  </div>
                </div>
                <Switch
                  id="webcamRequired"
                  checked={settings.proctoringSettings.webcamRequired}
                  onCheckedChange={(checked) =>
                    handleProctoringSettingChange('webcamRequired', checked)
                  }
                />
              </div>

              {/* Warning about webcam/screenshare */}
              {(settings.proctoringSettings.webcamRequired ||
                settings.proctoringSettings.screenshareRequired) && (
                <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-xs">
                    Webcam and screen share requirements may reduce participation.
                    Ensure students are informed beforehand.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}