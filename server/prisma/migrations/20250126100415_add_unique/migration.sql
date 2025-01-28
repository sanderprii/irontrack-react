/*
  Warnings:

  - A unique constraint covering the columns `[userId,affiliateId]` on the table `Members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Members_userId_affiliateId_key" ON "Members"("userId", "affiliateId");
