-- CreateTable
CREATE TABLE "ChatSessions" (
    "ChatSessionId" TEXT NOT NULL PRIMARY KEY,
    "UserId" TEXT,
    "SessionToken" TEXT NOT NULL,
    "StartedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "EndedAt" DATETIME,
    "IPAddress" TEXT NOT NULL,
    "UserAgent" TEXT NOT NULL,
    "DeviceType" TEXT NOT NULL,
    "TotalMessages" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "ChatMetrics" (
    "ChatMetricsId" TEXT NOT NULL PRIMARY KEY,
    "ChatHistoryId" TEXT NOT NULL,
    "ResponseTimeMs" INTEGER NOT NULL,
    "EmbeddingTimeMs" INTEGER,
    "SearchTimeMs" INTEGER,
    "OpenAITimeMs" INTEGER,
    "CacheHit" BOOLEAN NOT NULL,
    "SimilarityScore" REAL,
    "QuestionLength" INTEGER NOT NULL,
    "AnswerLength" INTEGER NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMetrics_ChatHistoryId_fkey" FOREIGN KEY ("ChatHistoryId") REFERENCES "ChatHistories" ("ChatHistoryId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatHistories" (
    "ChatHistoryId" TEXT NOT NULL PRIMARY KEY,
    "SessionId" TEXT,
    "Question" TEXT NOT NULL,
    "Answer" TEXT NOT NULL,
    "Source" TEXT NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatHistories_SessionId_fkey" FOREIGN KEY ("SessionId") REFERENCES "ChatSessions" ("ChatSessionId") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChatHistories" ("Answer", "ChatHistoryId", "CreatedAt", "Question", "Source") SELECT "Answer", "ChatHistoryId", "CreatedAt", "Question", "Source" FROM "ChatHistories";
DROP TABLE "ChatHistories";
ALTER TABLE "new_ChatHistories" RENAME TO "ChatHistories";
CREATE INDEX "ChatHistories_SessionId_idx" ON "ChatHistories"("SessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ChatSessions_SessionToken_key" ON "ChatSessions"("SessionToken");

-- CreateIndex
CREATE INDEX "ChatSessions_SessionToken_idx" ON "ChatSessions"("SessionToken");

-- CreateIndex
CREATE INDEX "ChatSessions_StartedAt_idx" ON "ChatSessions"("StartedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatMetrics_ChatHistoryId_key" ON "ChatMetrics"("ChatHistoryId");

-- CreateIndex
CREATE INDEX "ChatMetrics_CreatedAt_idx" ON "ChatMetrics"("CreatedAt");

-- CreateIndex
CREATE INDEX "ChatMetrics_ResponseTimeMs_idx" ON "ChatMetrics"("ResponseTimeMs");
