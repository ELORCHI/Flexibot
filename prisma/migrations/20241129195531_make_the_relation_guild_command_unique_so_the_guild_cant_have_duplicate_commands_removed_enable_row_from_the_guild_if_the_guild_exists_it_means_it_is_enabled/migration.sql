/*
  Warnings:

  - A unique constraint covering the columns `[guildId,name]` on the table `command` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `command` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "command" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "command_guildId_name_key" ON "command"("guildId", "name");
