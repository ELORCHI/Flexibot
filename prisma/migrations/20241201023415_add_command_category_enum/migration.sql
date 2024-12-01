/*
  Warnings:

  - You are about to drop the `command` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CommandCategory" AS ENUM ('INFO', 'MODERATION', 'UTILITY', 'RANKS');

-- DropForeignKey
ALTER TABLE "command" DROP CONSTRAINT "command_guildId_fkey";

-- DropTable
DROP TABLE "command";

-- CreateTable
CREATE TABLE "Command" (
    "id" SERIAL NOT NULL,
    "guildId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "CommandCategory" NOT NULL,
    "allowedChannels" TEXT,
    "ignoredChannels" TEXT,
    "allowedRoles" TEXT,
    "ignoredRoles" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Command_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Command_guildId_name_key" ON "Command"("guildId", "name");

-- AddForeignKey
ALTER TABLE "Command" ADD CONSTRAINT "Command_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
