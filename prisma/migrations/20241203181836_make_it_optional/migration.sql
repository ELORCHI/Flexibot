-- AlterTable
ALTER TABLE "Command" ALTER COLUMN "needsModerationRole" DROP NOT NULL,
ALTER COLUMN "needsModerationRole" SET DEFAULT false;
