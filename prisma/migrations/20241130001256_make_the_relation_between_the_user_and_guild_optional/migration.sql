-- DropForeignKey
ALTER TABLE "Guild" DROP CONSTRAINT "Guild_addedById_fkey";

-- AlterTable
ALTER TABLE "Guild" ALTER COLUMN "addedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
