/*
  Warnings:

  - You are about to drop the column `userId` on the `ModerationLog` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `Rank` table. All the data in the column will be lost.
  - Added the required column `rankName` to the `Rank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ModerationLog" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Rank" DROP COLUMN "roleId",
ADD COLUMN     "rankName" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserRank" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rankId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserRank_userId_rankId_key" ON "UserRank"("userId", "rankId");

-- AddForeignKey
ALTER TABLE "UserRank" ADD CONSTRAINT "UserRank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRank" ADD CONSTRAINT "UserRank_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "Rank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
