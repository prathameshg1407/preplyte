// src/module/profile/profile.types.ts

export interface ResumeResponse {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  isDefault: boolean;
  createdAt: Date;
}

export interface UploadResumeResponse {
  message: string;
  resume: ResumeResponse;
}

export interface SetDefaultResumeResponse {
  message: string;
  resume: ResumeResponse;
}

export interface DeleteResumeResponse {
  message: string;
}

// API Response wrapper (can be shared across modules)
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}