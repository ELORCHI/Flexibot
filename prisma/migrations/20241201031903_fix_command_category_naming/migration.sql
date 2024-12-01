/*
  Warnings:

  - The values [UTILITY,RANKS] on the enum `CommandCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CommandCategory_new" AS ENUM ('INFO', 'MODERATION', 'UTILS', 'ROLES');
ALTER TABLE "Command" ALTER COLUMN "category" TYPE "CommandCategory_new" USING ("category"::text::"CommandCategory_new");
ALTER TYPE "CommandCategory" RENAME TO "CommandCategory_old";
ALTER TYPE "CommandCategory_new" RENAME TO "CommandCategory";
DROP TYPE "CommandCategory_old";
COMMIT;
