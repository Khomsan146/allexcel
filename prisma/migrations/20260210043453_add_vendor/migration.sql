-- CreateTable
CREATE TABLE "VendorContract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "contractType" TEXT,
    "expiryDate" DATETIME,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "note" TEXT,
    "category" TEXT DEFAULT 'Monitor',
    "status" TEXT NOT NULL DEFAULT 'Unknown',
    "lastChecked" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ChecklistItem" ("category", "createdAt", "id", "lastChecked", "note", "status", "title", "updatedAt", "url") SELECT "category", "createdAt", "id", "lastChecked", "note", "status", "title", "updatedAt", "url" FROM "ChecklistItem";
DROP TABLE "ChecklistItem";
ALTER TABLE "new_ChecklistItem" RENAME TO "ChecklistItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
