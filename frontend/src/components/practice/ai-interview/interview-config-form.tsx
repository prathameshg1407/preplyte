// src/components/practice/ai-interview/interview-config-form.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { 
  Loader2, 
  Briefcase, 
  Building2, 
  FileText, 
  AlertCircle, 
  Upload, 
  X,
  Mic,
  ArrowRight
} from "lucide-react";
import { cn } from "../../../lib/utils";

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
    resumeFile?: File;
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
  const [selectedResumeId, setSelectedResumeId] = useState<string>("no-resume");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [resumesLoading, setResumesLoading] = useState(false);

  useEffect(() => {
    if (onFetchResumes && resumes.length === 0) {
      setResumesLoading(true);
      onFetchResumes()
        .then((data) => {
          setResumes(data);
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

  const handleResumeSelect = (value: string) => {
    setSelectedResumeId(value);
    if (value !== "no-resume") {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setSelectedResumeId("no-resume");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

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

  const isValid = jobTitle.trim().length > 0;

  return (
    <Card className="w-full max-w-md mx-auto border-border">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border">
          <Mic className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-semibold tracking-tight">
          AI Mock Interview
        </CardTitle>
        <CardDescription>
          Practice with an AI interviewer tailored to your role
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="text-sm font-medium">
              Job Title <span className="text-muted-foreground">*</span>
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="jobTitle"
                placeholder="Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                disabled={loading}
                autoComplete="off"
                className="h-11 pl-10"
              />
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium">
              Company <span className="text-muted-foreground text-xs font-normal">Optional</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyName"
                placeholder="Google, Amazon, etc."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={loading}
                autoComplete="off"
                className="h-11 pl-10"
              />
            </div>
          </div>

          {/* Resume Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Resume <span className="text-muted-foreground text-xs font-normal">Optional</span>
            </Label>
            
            <div className="space-y-3 p-4 border border-border rounded-lg bg-card">
              {/* Select Existing */}
              <Select
                value={selectedResumeId}
                onValueChange={handleResumeSelect}
                disabled={loading || resumesLoading || !!selectedFile}
              >
                <SelectTrigger 
                  className={cn(
                    "h-10",
                    selectedFile && "opacity-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <SelectValue
                      placeholder={resumesLoading ? "Loading..." : "Select saved resume"}
                    />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-resume">No resume</SelectItem>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id.toString()}>
                      {resume.fileName}
                      {resume.isDefault && " (Default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>
              </div>

              {/* Upload */}
              <div className="space-y-2">
                {!selectedFile ? (
                  <label
                    htmlFor="resume-upload"
                    className={cn(
                      "flex items-center justify-center gap-2 h-10 px-4",
                      "border border-dashed border-border rounded-lg",
                      "text-sm text-muted-foreground",
                      "cursor-pointer transition-colors",
                      "hover:border-foreground/30 hover:text-foreground",
                      loading && "pointer-events-none opacity-50"
                    )}
                  >
                    <Upload className="h-4 w-4" />
                    Upload new resume
                    <Input
                      ref={fileInputRef}
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-2 h-10 px-3 border border-border rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{selectedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      className="h-7 w-7 shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, or TXT up to 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 text-sm border border-border rounded-lg bg-secondary/50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-11"
            disabled={loading || !isValid}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing Interview...
              </>
            ) : (
              <>
                Start Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Tips */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-medium mb-2">Before you start</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {[
                "Find a quiet environment",
                "Allow microphone access",
                "Speak clearly and naturally"
              ].map((tip, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}