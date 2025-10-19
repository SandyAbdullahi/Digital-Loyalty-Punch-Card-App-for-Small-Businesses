/*
  Warnings:

  - Added the required column `businessName` to the `Merchant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessType` to the `Merchant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Merchant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "location" TEXT,
    "contact" TEXT,
    "logo" TEXT,
    "theme" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Merchant" ("createdAt", "email", "id", "logo", "name", "password", "theme", "updatedAt") SELECT "createdAt", "email", "id", "logo", "name", "password", "theme", "updatedAt" FROM "Merchant";
DROP TABLE "Merchant";
ALTER TABLE "new_Merchant" RENAME TO "Merchant";
CREATE UNIQUE INDEX "Merchant_email_key" ON "Merchant"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
