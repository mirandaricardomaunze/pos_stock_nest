/*
  Warnings:

  - Added the required column `startDate` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vacationDaysLeft" INTEGER NOT NULL DEFAULT 30;
