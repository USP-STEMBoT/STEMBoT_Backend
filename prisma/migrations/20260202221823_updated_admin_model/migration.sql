/*
  Warnings:

  - A unique constraint covering the columns `[UserEmailAddress]` on the table `AdminUsers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AdminUsers_UserEmailAddress_key" ON "AdminUsers"("UserEmailAddress");
