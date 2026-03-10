-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT');

-- CreateEnum
CREATE TYPE "InternshipType" AS ENUM ('SUMMER', 'WINTER', 'SEMESTER', 'PART_TIME', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "DurationType" AS ENUM ('WEEKS', 'MONTHS');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ON_SITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN', 'HIRED');

-- CreateEnum
CREATE TYPE "HackathonStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'SUBMISSION_OPEN', 'SUBMISSION_CLOSED', 'JUDGING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "HackathonMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "ParticipationType" AS ENUM ('INDIVIDUAL', 'TEAM', 'BOTH');

-- CreateEnum
CREATE TYPE "HackathonRegistrationStatus" AS ENUM ('REGISTERED', 'CONFIRMED', 'WITHDRAWN', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('FORMING', 'COMPLETE', 'LOCKED', 'DISQUALIFIED');

-- CreateEnum
CREATE TYPE "TeamMemberRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "HackathonSubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DISQUALIFIED', 'SHORTLISTED', 'WINNER');

-- CreateEnum
CREATE TYPE "RoadmapStepStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterEnum
ALTER TYPE "QuestionType" ADD VALUE 'DATA_INTERPRETATION';

-- CreateTable
CREATE TABLE "user_roadmaps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "totalDuration" TEXT,
    "shareToken" TEXT,
    "conversationHistory" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roadmap_steps" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skills" TEXT[],
    "duration" TEXT,
    "status" "RoadmapStepStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roadmap_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_postings" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT,
    "createdById" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "jobType" "JobType" NOT NULL,
    "workMode" "WorkMode" NOT NULL,
    "location" TEXT NOT NULL,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT NOT NULL DEFAULT 'INR',
    "vacancies" INTEGER NOT NULL,
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "isResumeRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "eligibilityCriteria" JSONB,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "applicationsStarted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "coverLetter" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internships" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT,
    "createdById" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "internshipType" "InternshipType" NOT NULL,
    "durationValue" INTEGER NOT NULL,
    "durationType" "DurationType" NOT NULL,
    "startDate" TIMESTAMP(3),
    "isFlexibleDates" BOOLEAN NOT NULL DEFAULT false,
    "workMode" "WorkMode" NOT NULL,
    "location" TEXT NOT NULL,
    "stipendMin" INTEGER,
    "stipendMax" INTEGER,
    "stipendCurrency" TEXT NOT NULL DEFAULT 'INR',
    "isPaid" BOOLEAN NOT NULL DEFAULT true,
    "hasPPO" BOOLEAN NOT NULL DEFAULT false,
    "ppoDetails" TEXT,
    "vacancies" INTEGER NOT NULL,
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "isResumeRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "OpportunityStatus" NOT NULL DEFAULT 'DRAFT',
    "eligibilityCriteria" JSONB,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "applicationsStarted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_applications" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "coverLetter" TEXT,
    "availableFrom" TIMESTAMP(3),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internship_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathons" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT NOT NULL,
    "rules" TEXT,
    "themes" TEXT[],
    "mode" "HackathonMode" NOT NULL,
    "venue" TEXT,
    "websiteUrl" TEXT,
    "bannerUrl" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "participationType" "ParticipationType" NOT NULL,
    "minTeamSize" INTEGER NOT NULL DEFAULT 1,
    "maxTeamSize" INTEGER NOT NULL DEFAULT 4,
    "registrationStartDate" TIMESTAMP(3) NOT NULL,
    "registrationEndDate" TIMESTAMP(3) NOT NULL,
    "eventStartDate" TIMESTAMP(3) NOT NULL,
    "eventEndDate" TIMESTAMP(3) NOT NULL,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "resultsDate" TIMESTAMP(3),
    "maxParticipants" INTEGER,
    "prizes" JSONB,
    "isResumeRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" "HackathonStatus" NOT NULL DEFAULT 'DRAFT',
    "eligibilityCriteria" JSONB,
    "viewsCount" INTEGER NOT NULL DEFAULT 0,
    "registrationsStarted" INTEGER NOT NULL DEFAULT 0,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "teamCount" INTEGER NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_registrations" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "status" "HackathonRegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "resumeId" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_teams" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "leaderId" TEXT NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'FORMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentSize" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "hackathon_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_team_members" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hackathon_submissions" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "teamId" TEXT,
    "registrationId" TEXT,
    "projectName" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "techStack" TEXT[],
    "repositoryUrl" TEXT NOT NULL,
    "demoUrl" TEXT,
    "videoUrl" TEXT,
    "presentationUrl" TEXT,
    "screenshotsUrls" TEXT[],
    "status" "HackathonSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "rank" INTEGER,
    "feedback" TEXT,
    "prizeWon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastSavedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hackathon_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_roadmaps_shareToken_key" ON "user_roadmaps"("shareToken");

-- CreateIndex
CREATE INDEX "user_roadmaps_userId_idx" ON "user_roadmaps"("userId");

-- CreateIndex
CREATE INDEX "user_roadmaps_shareToken_idx" ON "user_roadmaps"("shareToken");

-- CreateIndex
CREATE INDEX "user_roadmap_steps_roadmapId_idx" ON "user_roadmap_steps"("roadmapId");

-- CreateIndex
CREATE INDEX "job_postings_instituteId_idx" ON "job_postings"("instituteId");

-- CreateIndex
CREATE INDEX "job_postings_instituteId_status_idx" ON "job_postings"("instituteId", "status");

-- CreateIndex
CREATE INDEX "job_postings_status_idx" ON "job_postings"("status");

-- CreateIndex
CREATE INDEX "job_postings_createdById_idx" ON "job_postings"("createdById");

-- CreateIndex
CREATE INDEX "job_postings_applicationDeadline_idx" ON "job_postings"("applicationDeadline");

-- CreateIndex
CREATE INDEX "job_postings_status_applicationDeadline_idx" ON "job_postings"("status", "applicationDeadline");

-- CreateIndex
CREATE INDEX "job_postings_isDeleted_idx" ON "job_postings"("isDeleted");

-- CreateIndex
CREATE INDEX "job_postings_status_createdAt_idx" ON "job_postings"("status", "createdAt");

-- CreateIndex
CREATE INDEX "job_postings_instituteId_createdAt_idx" ON "job_postings"("instituteId", "createdAt");

-- CreateIndex
CREATE INDEX "job_applications_jobId_idx" ON "job_applications"("jobId");

-- CreateIndex
CREATE INDEX "job_applications_userId_idx" ON "job_applications"("userId");

-- CreateIndex
CREATE INDEX "job_applications_jobId_status_idx" ON "job_applications"("jobId", "status");

-- CreateIndex
CREATE INDEX "job_applications_userId_status_idx" ON "job_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jobId_userId_key" ON "job_applications"("jobId", "userId");

-- CreateIndex
CREATE INDEX "internships_instituteId_idx" ON "internships"("instituteId");

-- CreateIndex
CREATE INDEX "internships_instituteId_status_idx" ON "internships"("instituteId", "status");

-- CreateIndex
CREATE INDEX "internships_status_idx" ON "internships"("status");

-- CreateIndex
CREATE INDEX "internships_createdById_idx" ON "internships"("createdById");

-- CreateIndex
CREATE INDEX "internships_applicationDeadline_idx" ON "internships"("applicationDeadline");

-- CreateIndex
CREATE INDEX "internships_status_applicationDeadline_idx" ON "internships"("status", "applicationDeadline");

-- CreateIndex
CREATE INDEX "internships_internshipType_idx" ON "internships"("internshipType");

-- CreateIndex
CREATE INDEX "internships_isDeleted_idx" ON "internships"("isDeleted");

-- CreateIndex
CREATE INDEX "internships_status_createdAt_idx" ON "internships"("status", "createdAt");

-- CreateIndex
CREATE INDEX "internships_instituteId_createdAt_idx" ON "internships"("instituteId", "createdAt");

-- CreateIndex
CREATE INDEX "internship_applications_internshipId_idx" ON "internship_applications"("internshipId");

-- CreateIndex
CREATE INDEX "internship_applications_userId_idx" ON "internship_applications"("userId");

-- CreateIndex
CREATE INDEX "internship_applications_internshipId_status_idx" ON "internship_applications"("internshipId", "status");

-- CreateIndex
CREATE INDEX "internship_applications_userId_status_idx" ON "internship_applications"("userId", "status");

-- CreateIndex
CREATE INDEX "internship_applications_status_idx" ON "internship_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "internship_applications_internshipId_userId_key" ON "internship_applications"("internshipId", "userId");

-- CreateIndex
CREATE INDEX "hackathons_instituteId_idx" ON "hackathons"("instituteId");

-- CreateIndex
CREATE INDEX "hackathons_instituteId_status_idx" ON "hackathons"("instituteId", "status");

-- CreateIndex
CREATE INDEX "hackathons_status_idx" ON "hackathons"("status");

-- CreateIndex
CREATE INDEX "hackathons_createdById_idx" ON "hackathons"("createdById");

-- CreateIndex
CREATE INDEX "hackathons_registrationStartDate_registrationEndDate_idx" ON "hackathons"("registrationStartDate", "registrationEndDate");

-- CreateIndex
CREATE INDEX "hackathons_eventStartDate_eventEndDate_idx" ON "hackathons"("eventStartDate", "eventEndDate");

-- CreateIndex
CREATE INDEX "hackathons_status_eventStartDate_idx" ON "hackathons"("status", "eventStartDate");

-- CreateIndex
CREATE INDEX "hackathons_isDeleted_idx" ON "hackathons"("isDeleted");

-- CreateIndex
CREATE INDEX "hackathons_status_createdAt_idx" ON "hackathons"("status", "createdAt");

-- CreateIndex
CREATE INDEX "hackathons_instituteId_createdAt_idx" ON "hackathons"("instituteId", "createdAt");

-- CreateIndex
CREATE INDEX "hackathon_registrations_hackathonId_idx" ON "hackathon_registrations"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_registrations_userId_idx" ON "hackathon_registrations"("userId");

-- CreateIndex
CREATE INDEX "hackathon_registrations_hackathonId_status_idx" ON "hackathon_registrations"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "hackathon_registrations_teamId_idx" ON "hackathon_registrations"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_registrations_hackathonId_userId_key" ON "hackathon_registrations"("hackathonId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_teams_inviteCode_key" ON "hackathon_teams"("inviteCode");

-- CreateIndex
CREATE INDEX "hackathon_teams_hackathonId_idx" ON "hackathon_teams"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_teams_hackathonId_status_idx" ON "hackathon_teams"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "hackathon_teams_inviteCode_idx" ON "hackathon_teams"("inviteCode");

-- CreateIndex
CREATE INDEX "hackathon_teams_leaderId_idx" ON "hackathon_teams"("leaderId");

-- CreateIndex
CREATE INDEX "hackathon_team_members_teamId_idx" ON "hackathon_team_members"("teamId");

-- CreateIndex
CREATE INDEX "hackathon_team_members_userId_idx" ON "hackathon_team_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_team_members_teamId_userId_key" ON "hackathon_team_members"("teamId", "userId");

-- CreateIndex
CREATE INDEX "hackathon_submissions_hackathonId_idx" ON "hackathon_submissions"("hackathonId");

-- CreateIndex
CREATE INDEX "hackathon_submissions_hackathonId_status_idx" ON "hackathon_submissions"("hackathonId", "status");

-- CreateIndex
CREATE INDEX "hackathon_submissions_status_idx" ON "hackathon_submissions"("status");

-- CreateIndex
CREATE INDEX "hackathon_submissions_hackathonId_rank_idx" ON "hackathon_submissions"("hackathonId", "rank");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_submissions_teamId_key" ON "hackathon_submissions"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_submissions_registrationId_key" ON "hackathon_submissions"("registrationId");

-- AddForeignKey
ALTER TABLE "user_roadmaps" ADD CONSTRAINT "user_roadmaps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roadmap_steps" ADD CONSTRAINT "user_roadmap_steps_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "user_roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathons" ADD CONSTRAINT "hackathons_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "hackathon_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_registrations" ADD CONSTRAINT "hackathon_registrations_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_teams" ADD CONSTRAINT "hackathon_teams_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_teams" ADD CONSTRAINT "hackathon_teams_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_team_members" ADD CONSTRAINT "hackathon_team_members_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "hackathon_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_team_members" ADD CONSTRAINT "hackathon_team_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "hackathon_teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hackathon_submissions" ADD CONSTRAINT "hackathon_submissions_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "hackathon_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
