/*
  Warnings:

  - Added the required column `userId` to the `Installment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Installment_name_payDate_key";

-- AlterTable
ALTER TABLE "Installment" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Installment_userId_idx" ON "Installment"("userId");
