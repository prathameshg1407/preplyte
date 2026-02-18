-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "collegeName" TEXT,
ALTER COLUMN "studentId" DROP NOT NULL,
ALTER COLUMN "courseYear" DROP NOT NULL,
ALTER COLUMN "departmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "profilePictureUrl" TEXT;
