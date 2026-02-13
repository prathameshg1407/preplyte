-- CreateEnum
CREATE TYPE "ResumeTemplateCategory" AS ENUM ('PROFESSIONAL', 'CREATIVE', 'MODERN', 'MINIMAL', 'ACADEMIC', 'TECHNICAL');

-- CreateTable
CREATE TABLE "ResumeTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "category" "ResumeTemplateCategory" NOT NULL DEFAULT 'PROFESSIONAL',
    "layout" JSONB NOT NULL,
    "styles" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Untitled Resume',
    "slug" TEXT,
    "personalInfo" JSONB,
    "summary" JSONB,
    "experience" JSONB,
    "education" JSONB,
    "skills" JSONB,
    "projects" JSONB,
    "certifications" JSONB,
    "languages" JSONB,
    "achievements" JSONB,
    "customSections" JSONB,
    "sectionOrder" TEXT[] DEFAULT ARRAY['personalInfo', 'summary', 'experience', 'education', 'skills', 'projects']::TEXT[],
    "hiddenSections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customStyles" JSONB,
    "colorScheme" TEXT,
    "fontFamily" TEXT,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "lastAtsScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserResume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "changeNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResumeTemplate_slug_key" ON "ResumeTemplate"("slug");

-- CreateIndex
CREATE INDEX "ResumeTemplate_category_isActive_idx" ON "ResumeTemplate"("category", "isActive");

-- CreateIndex
CREATE INDEX "ResumeTemplate_slug_idx" ON "ResumeTemplate"("slug");

-- CreateIndex
CREATE INDEX "UserResume_userId_idx" ON "UserResume"("userId");

-- CreateIndex
CREATE INDEX "UserResume_templateId_idx" ON "UserResume"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "UserResume_userId_slug_key" ON "UserResume"("userId", "slug");

-- CreateIndex
CREATE INDEX "ResumeVersion_resumeId_idx" ON "ResumeVersion"("resumeId");

-- CreateIndex
CREATE UNIQUE INDEX "ResumeVersion_resumeId_version_key" ON "ResumeVersion"("resumeId", "version");

-- AddForeignKey
ALTER TABLE "UserResume" ADD CONSTRAINT "UserResume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResume" ADD CONSTRAINT "UserResume_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ResumeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "UserResume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
