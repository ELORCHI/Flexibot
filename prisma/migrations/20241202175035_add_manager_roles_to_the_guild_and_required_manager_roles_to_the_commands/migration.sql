/*
  Warnings:

  - Added the required column `needsModerationRole` to the `Command` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "needsModerationRole" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "managerRoles" TEXT[];
