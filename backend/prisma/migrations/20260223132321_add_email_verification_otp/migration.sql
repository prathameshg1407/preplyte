-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerificationOtp" TEXT,
ADD COLUMN     "emailVerificationOtpExpiry" TIMESTAMP(3),
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "lms_course_comments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lms_course_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_course_comment_likes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lms_course_comment_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lms_course_comments_courseId_idx" ON "lms_course_comments"("courseId");

-- CreateIndex
CREATE INDEX "lms_course_comments_parentId_idx" ON "lms_course_comments"("parentId");

-- CreateIndex
CREATE INDEX "lms_course_comment_likes_commentId_idx" ON "lms_course_comment_likes"("commentId");

-- CreateIndex
CREATE UNIQUE INDEX "lms_course_comment_likes_userId_commentId_key" ON "lms_course_comment_likes"("userId", "commentId");

-- AddForeignKey
ALTER TABLE "lms_course_comments" ADD CONSTRAINT "lms_course_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_course_comments" ADD CONSTRAINT "lms_course_comments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "lms_courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_course_comments" ADD CONSTRAINT "lms_course_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "lms_course_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_course_comment_likes" ADD CONSTRAINT "lms_course_comment_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lms_course_comment_likes" ADD CONSTRAINT "lms_course_comment_likes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "lms_course_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
