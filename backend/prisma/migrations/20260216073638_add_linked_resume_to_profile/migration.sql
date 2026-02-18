-- Add linkedResumeId to Resume table to link with UserResume
ALTER TABLE "resumes" ADD COLUMN "linkedResumeId" TEXT;

-- Add foreign key constraint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_linkedResumeId_fkey" 
  FOREIGN KEY ("linkedResumeId") REFERENCES "UserResume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add index for better query performance
CREATE INDEX "resumes_linkedResumeId_idx" ON "resumes"("linkedResumeId");

-- Add unique constraint to ensure one Resume per UserResume
CREATE UNIQUE INDEX "resumes_linkedResumeId_key" ON "resumes"("linkedResumeId");
