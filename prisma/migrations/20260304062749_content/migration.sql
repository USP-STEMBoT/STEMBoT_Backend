-- CreateTable
CREATE TABLE "Questions" (
    "QuestionId" TEXT NOT NULL,
    "Question" TEXT NOT NULL,
    "Answer" TEXT NOT NULL,
    "Embedding" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("QuestionId")
);

-- CreateTable
CREATE TABLE "ChatHistories" (
    "ChatHistoryId" TEXT NOT NULL,
    "Question" TEXT NOT NULL,
    "Answer" TEXT NOT NULL,
    "Source" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatHistories_pkey" PRIMARY KEY ("ChatHistoryId")
);

-- CreateTable
CREATE TABLE "AdminUsers" (
    "AdminUserId" TEXT NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Password" TEXT NOT NULL,
    "UserEmailAddress" TEXT NOT NULL,
    "UserName" TEXT NOT NULL,
    "UserAccountStatus" TEXT NOT NULL,
    "UserLastLoginTimeStamp" TIMESTAMP(3),
    "IsUserLoggedInFlag" BOOLEAN NOT NULL,

    CONSTRAINT "AdminUsers_pkey" PRIMARY KEY ("AdminUserId")
);

-- CreateTable
CREATE TABLE "Logs" (
    "LogId" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "IPAddress" TEXT NOT NULL,
    "Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DeviceInfo" TEXT NOT NULL,
    "ActionType" TEXT NOT NULL,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("LogId")
);

-- CreateTable
CREATE TABLE "StudentFeedbacks" (
    "StudentFeedbackId" TEXT NOT NULL,
    "StudentName" TEXT NOT NULL,
    "StudentID" TEXT,
    "Rating" INTEGER NOT NULL,
    "FeedbackText" TEXT NOT NULL,
    "SubmittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentFeedbacks_pkey" PRIMARY KEY ("StudentFeedbackId")
);

-- CreateIndex
CREATE INDEX "Questions_Question_idx" ON "Questions"("Question");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUsers_UserEmailAddress_key" ON "AdminUsers"("UserEmailAddress");

-- CreateIndex
CREATE INDEX "StudentFeedbacks_StudentID_idx" ON "StudentFeedbacks"("StudentID");

-- CreateIndex
CREATE INDEX "StudentFeedbacks_Rating_idx" ON "StudentFeedbacks"("Rating");

-- CreateIndex
CREATE INDEX "StudentFeedbacks_SubmittedAt_idx" ON "StudentFeedbacks"("SubmittedAt");
