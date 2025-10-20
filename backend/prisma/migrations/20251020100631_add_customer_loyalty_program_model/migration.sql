-- CreateTable
CREATE TABLE "CustomerLoyaltyProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "loyaltyProgramId" TEXT NOT NULL,
    "stampsEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerLoyaltyProgram_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustomerLoyaltyProgram_loyaltyProgramId_fkey" FOREIGN KEY ("loyaltyProgramId") REFERENCES "LoyaltyProgram" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
