/*
  Warnings:

  - You are about to drop the `GuildSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GuildSettings" DROP CONSTRAINT "GuildSettings_guildId_fkey";

-- DropTable
DROP TABLE "GuildSettings";
