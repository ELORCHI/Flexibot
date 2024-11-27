/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Guild` table. All the data in the column will be lost.
  - The primary key for the `GuildSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `isEnabled` on the `GuildSettings` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `GuildSettings` table. All the data in the column will be lost.
  - You are about to drop the column `discriminator` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `addedById` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Guild" DROP CONSTRAINT "Guild_ownerId_fkey";

-- DropIndex
DROP INDEX "Guild_id_key";

-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "updatedAt",
ADD COLUMN     "addedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GuildSettings" DROP CONSTRAINT "GuildSettings_pkey",
DROP COLUMN "isEnabled",
DROP COLUMN "updatedAt",
ADD COLUMN     "moderation" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GuildSettings_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GuildSettings_id_seq";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "discriminator",
DROP COLUMN "updatedAt",
ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommandStatus" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT,
    "command" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommandStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandStatus" ADD CONSTRAINT "CommandStatus_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommandStatus" ADD CONSTRAINT "CommandStatus_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
