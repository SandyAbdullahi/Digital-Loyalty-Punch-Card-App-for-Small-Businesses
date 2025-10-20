/*
  Warnings:

  - A unique constraint covering the columns `[customerId,loyaltyProgramId]` on the table `CustomerLoyaltyProgram` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CustomerLoyaltyProgram_customerId_loyaltyProgramId_key" ON "CustomerLoyaltyProgram"("customerId", "loyaltyProgramId");
