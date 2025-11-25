// src/components/practice/ai-interview/interview-config-form.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Briefcase, 
  Building2, 
  FileText, 
  AlertCircle, 
  Upload, 
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Resume {
  id: number;
  fileName: string;
  isDefault?: boolean;
}

interface InterviewConfigFormProps {
  onStart: (config: {
    jobTitle: string;
    companyName?: string;
    resumeId?: number;
    resumeFile?: File; // Added support for raw file
  }) => Promise<void>;
  loading: boolean;
  error: string | null;
  resumes?: Resume[];
  onFetchResumes?: () => Promise<Resume[]>;
}

export function InterviewConfigForm({
  onStart,
  loading,
  error,
  resumes: initialResumes = [],
  onFetchResumes,
}: InterviewConfigFormProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  
  // State for resume selection vs upload
  const [selectedResumeId, setSelectedResumeId] = useState<string>("no-resume");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [resumesLoading, setResumesLoading] = useState(false);

  // Fetch resumes on mount
  useEffect(() => {
    if (onFetchResumes && resumes.length === 0) {
      setResumesLoading(true);
      onFetchResumes()
        .then((data) => {
          setResumes(data);
          // Auto-select default resume only if no file is selected
          if (!selectedFile) {
            const defaultResume = data.find((r) => r.isDefault);
            if (defaultResume) {
              setSelectedResumeId(defaultResume.id.toString());
            }
          }
        })
        .catch(console.error)
        .finally(() => setResumesLoading(false));
    }
  }, [onFetchResumes]);

  // Handle Dropdown Selection
  const handleResumeSelect = (value: string) => {
    setSelectedResumeId(value);
    // If user selects a list item, clear the file upload
    if (value !== "no-resume") {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Deselect dropdown
      setSelectedResumeId("no-resume");
    }
  };

  // Clear File Upload
  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle.trim()) {
      return;
    }

    const finalResumeId = 
      selectedResumeId && selectedResumeId !== "no-resume" 
        ? parseInt(selectedResumeId) 
        : undefined;

    await onStart({
      jobTitle: jobTitle.trim(),
      companyName: companyName.trim() || undefined,
      resumeId: finalResumeId,
      resumeFile: selectedFile || undefined,
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">AI Interview Practice</CardTitle>
        <CardDescription>
          Practice your interview skills with our AI interviewer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Job Title *
            </Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Software Engineer, Product Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name (Optional)
            </Label>
            <Input
              id="companyName"
              placeholder="e.g., Google, Amazon, Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {/* Resume Selection Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resume Context (Optional)
            </Label>
            
            <div className="space-y-3 p-4 border rounded-md bg-card/50">
              {/* Option A: Select Existing */}
              <div className="space-y-2">
                <Label htmlFor="resume-select" className="text-xs text-muted-foreground font-normal uppercase">
                  Select from profile
                </Label>
                <Select
                  value={selectedResumeId}
                  onValueChange={handleResumeSelect}
                  disabled={loading || resumesLoading || !!selectedFile}
                >
                  <SelectTrigger id="resume-select" className={cn(selectedFile && "opacity-50")}>
                    <SelectValue
                      placeholder={
                        resumesLoading ? "Loading resumes..." : "Choose a saved resume"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-resume">No saved resume</SelectItem>
                    {resumes.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id.toString()}>
                        {resume.fileName}
                        {resume.isDefault && " (Default)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or upload new</span>
                </div>
              </div>

              {/* Option B: Upload New */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="cursor-pointer file:cursor-pointer file:text-primary file:font-medium"
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Upload className="w-3 h-3" />
                    Using: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || !jobTitle.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Interview...
              </>
            ) : (
              "Start Interview"
            )}
          </Button>

          {/* Tips */}
          <div className="text-sm text-muted-foreground space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="font-medium">💡 Tips for best experience:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use a quiet environment</li>
              <li>Allow microphone access when prompted</li>
              <li>Speak clearly and at a moderate pace</li>
              <li>Take a moment to think before answering</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}