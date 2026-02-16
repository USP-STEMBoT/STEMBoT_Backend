-- CreateTable
CREATE TABLE "StudentFeedbacks" (
    "StudentFeedbackId" TEXT NOT NULL PRIMARY KEY,
    "StudentName" TEXT NOT NULL,
    "StudentID" TEXT,
    "Rating" INTEGER NOT NULL,
    "FeedbackText" TEXT NOT NULL,
    "SubmittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "StudentFeedbacks_StudentID_idx" ON "StudentFeedbacks"("StudentID");

-- CreateIndex
CREATE INDEX "StudentFeedbacks_Rating_idx" ON "StudentFeedbacks"("Rating");

-- CreateIndex
CREATE INDEX "StudentFeedbacks_SubmittedAt_idx" ON "StudentFeedbacks"("SubmittedAt");
