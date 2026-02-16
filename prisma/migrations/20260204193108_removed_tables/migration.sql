/*
  Warnings:

  - You are about to drop the `ChatMetrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatSessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `SessionId` on the `ChatHistories` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ChatMetrics_ResponseTimeMs_idx";

-- DropIndex
DROP INDEX "ChatMetrics_CreatedAt_idx";

-- DropIndex
DROP INDEX "ChatMetrics_ChatHistoryId_key";

-- DropIndex
DROP INDEX "ChatSessions_StartedAt_idx";

-- DropIndex
DROP INDEX "ChatSessions_SessionToken_idx";

-- DropIndex
DROP INDEX "ChatSessions_SessionToken_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ChatMetrics";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ChatSessions";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatHistories" (
    "ChatHistoryId" TEXT NOT NULL PRIMARY KEY,
    "Question" TEXT NOT NULL,
    "Answer" TEXT NOT NULL,
    "Source" TEXT NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ChatHistories" ("Answer", "ChatHistoryId", "CreatedAt", "Question", "Source") SELECT "Answer", "ChatHistoryId", "CreatedAt", "Question", "Source" FROM "ChatHistories";
DROP TABLE "ChatHistories";
ALTER TABLE "new_ChatHistories" RENAME TO "ChatHistories";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
