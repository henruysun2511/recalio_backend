-- AlterEnum
CREATE TYPE "SessionType_new" AS ENUM ('NORMAL', 'CRAM', 'PREVIEW');
ALTER TABLE "study_sessions" ALTER COLUMN "sessionType" DROP DEFAULT;
ALTER TABLE "study_sessions" ALTER COLUMN "sessionType" TYPE "SessionType_new" USING ("sessionType"::text::"SessionType_new");
ALTER TABLE "study_sessions" ALTER COLUMN "sessionType" SET DEFAULT 'NORMAL';
DROP TYPE "SessionType";
ALTER TYPE "SessionType_new" RENAME TO "SessionType";
