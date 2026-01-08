/*
  Warnings:

  - You are about to drop the column `category` on the `ExpenseType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN "image" TEXT;
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- CreateTable
CREATE TABLE "Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "real" REAL NOT NULL,
    "previsto" REAL DEFAULT 0,
    "vencimento" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "typeId" INTEGER,
    "statusId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "parcelaAtual" INTEGER DEFAULT 1,
    "totalParcelas" INTEGER DEFAULT 1,
    CONSTRAINT "Expense_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ExpenseType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("createdAt", "descricao", "id", "previsto", "real", "responsavel", "status", "statusId", "typeId", "updatedAt", "userId", "vencimento") SELECT "createdAt", "descricao", "id", "previsto", "real", "responsavel", "status", "statusId", "typeId", "updatedAt", "userId", "vencimento" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE TABLE "new_ExpenseType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ExpenseType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ExpenseType" ("createdAt", "id", "isActive", "name") SELECT "createdAt", "id", "isActive", "name" FROM "ExpenseType";
DROP TABLE "ExpenseType";
ALTER TABLE "new_ExpenseType" RENAME TO "ExpenseType";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
