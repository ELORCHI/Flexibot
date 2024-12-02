/*
  Warnings:

  - Added the required column `example` to the `Command` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requiredpermissions` to the `Command` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usage` to the `Command` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Command" ADD COLUMN     "example" TEXT NOT NULL,
ADD COLUMN     "requiredpermissions" TEXT NOT NULL,
ADD COLUMN     "usage" TEXT NOT NULL;
