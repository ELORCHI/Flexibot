/*
  Warnings:

  - You are about to drop the `UserRank` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserRank" DROP CONSTRAINT "UserRank_rankId_fkey";

-- DropForeignKey
ALTER TABLE "UserRank" DROP CONSTRAINT "UserRank_userId_fkey";

-- AlterTable
ALTER TABLE "Rank" ADD COLUMN     "userIds" TEXT[];

-- DropTable
DROP TABLE "UserRank";
