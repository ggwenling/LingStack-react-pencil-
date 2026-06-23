-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ChatThread_userId_deletedAt_updatedAt_idx" ON "ChatThread"("userId", "deletedAt", "updatedAt");
