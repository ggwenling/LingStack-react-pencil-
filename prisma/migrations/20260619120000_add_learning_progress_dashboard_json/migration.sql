-- AlterTable
ALTER TABLE "LearningProgress" ADD COLUMN "roadmapSteps" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "LearningProgress" ADD COLUMN "dailyTasks" JSONB NOT NULL DEFAULT '[]';
