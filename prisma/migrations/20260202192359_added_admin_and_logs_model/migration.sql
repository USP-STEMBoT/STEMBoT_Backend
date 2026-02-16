/*
  Warnings:

  - You are about to drop the `ChatHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ChatHistory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Question";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Questions" (
    "QuestionId" TEXT NOT NULL PRIMARY KEY,
    "Question" TEXT NOT NULL,
    "Answer" TEXT NOT NULL,
    "Embedding" TEXT NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChatHistories" (
    "ChatHistoryId" TEXT NOT NULL PRIMARY KEY,
    "Question" TEXT NOT NULL,
    "Answer" TEXT NOT NULL,
    "Source" TEXT NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AdminUsers" (
    "AdminUserId" TEXT NOT NULL PRIMARY KEY,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "CreatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Password" TEXT NOT NULL,
    "UserEmailAddress" TEXT NOT NULL,
    "UserName" TEXT NOT NULL,
    "UserAccountStatus" TEXT NOT NULL,
    "UserLastLoginTimeStamp" DATETIME,
    "IsUserLoggedInFlag" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Logs" (
    "LogId" TEXT NOT NULL PRIMARY KEY,
    "Description" TEXT NOT NULL,
    "IPAddress" TEXT NOT NULL,
    "Timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeviceInfo" TEXT NOT NULL,
    "ActionType" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Questions_Question_idx" ON "Questions"("Question");
