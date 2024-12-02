/*
  Warnings:

  - Added the required column `nickname` to the `Command` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "nickname" TEXT NOT NULL,
ADD COLUMN     "updatesChannel" TEXT;
