-- DropIndex
DROP INDEX "lms_test_responses_attemptId_idx";

-- AlterTable
ALTER TABLE "lms_courses" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "lms_course_feedbacks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_course_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lms_course_feedbacks_courseId_idx" ON "lms_course_feedbacks"("courseId");

-- CreateIndex
CREATE INDEX "lms_course_feedbacks_userId_idx" ON "lms_course_feedbacks"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "lms_course_feedbacks_userId_courseId_key" ON "lms_course_feedbacks"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "lms_course_feedbacks" ADD CONSTRAINT "lms_course_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_course_feedbacks" ADD CONSTRAINT "lms_course_feedbacks_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "lms_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
