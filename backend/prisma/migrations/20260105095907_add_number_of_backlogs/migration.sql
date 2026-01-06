-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "numberOfBacklogs" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "student_profiles_numberOfBacklogs_idx" ON "student_profiles"("numberOfBacklogs");
