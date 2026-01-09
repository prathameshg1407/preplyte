/*
  Warnings:

  - You are about to drop the column `allowedDepartments` on the `mock_drive_eligibility` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `mock_drive_leaderboard` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `student_profiles` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `student_profiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "student_profiles_department_courseYear_idx";

-- DropIndex
DROP INDEX "student_profiles_department_idx";

-- AlterTable
ALTER TABLE "mock_drive_eligibility" DROP COLUMN "allowedDepartments",
ADD COLUMN     "allowedDepartmentIds" TEXT[];

-- AlterTable
ALTER TABLE "mock_drive_leaderboard" DROP COLUMN "department",
ADD COLUMN     "departmentCode" TEXT,
ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "departmentName" TEXT;

-- AlterTable
ALTER TABLE "student_profiles" DROP COLUMN "department",
ADD COLUMN     "departmentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "instituteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departments_instituteId_idx" ON "departments"("instituteId");

-- CreateIndex
CREATE INDEX "departments_instituteId_isActive_idx" ON "departments"("instituteId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "departments_instituteId_name_key" ON "departments"("instituteId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_instituteId_code_key" ON "departments"("instituteId", "code");

-- CreateIndex
CREATE INDEX "mock_drive_leaderboard_mockDriveId_departmentId_idx" ON "mock_drive_leaderboard"("mockDriveId", "departmentId");

-- CreateIndex
CREATE INDEX "student_profiles_departmentId_idx" ON "student_profiles"("departmentId");

-- CreateIndex
CREATE INDEX "student_profiles_departmentId_courseYear_idx" ON "student_profiles"("departmentId", "courseYear");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_instituteId_fkey" FOREIGN KEY ("instituteId") REFERENCES "institutes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
