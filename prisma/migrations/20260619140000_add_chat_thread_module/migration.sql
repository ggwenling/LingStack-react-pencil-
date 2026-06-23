-- CreateEnum
CREATE TYPE "LearningModule" AS ENUM ('REACT', 'NEXT');

-- AlterTable
ALTER TABLE "ChatThread" ADD COLUMN "module" "LearningModule" NOT NULL DEFAULT 'REACT';

-- CreateIndex
CREATE INDEX "ChatThread_userId_module_deletedAt_updatedAt_idx" ON "ChatThread"("userId", "module", "deletedAt", "updatedAt");
