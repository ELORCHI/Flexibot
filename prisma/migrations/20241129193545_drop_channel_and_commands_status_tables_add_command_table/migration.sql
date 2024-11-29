/*
  Warnings:

  - You are about to drop the `Channel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommandStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_guildId_fkey";

-- DropForeignKey
ALTER TABLE "CommandStatus" DROP CONSTRAINT "CommandStatus_channelId_fkey";

-- DropForeignKey
ALTER TABLE "CommandStatus" DROP CONSTRAINT "CommandStatus_guildId_fkey";

-- DropTable
DROP TABLE "Channel";

-- DropTable
DROP TABLE "CommandStatus";

-- CreateTable
CREATE TABLE "command" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "allowedChannels" TEXT,
    "ignoredChannels" TEXT,
    "allowedRoles" TEXT,
    "ignoredRoles" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "command_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "command" ADD CONSTRAINT "command_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
