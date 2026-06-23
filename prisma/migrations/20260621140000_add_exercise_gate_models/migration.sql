-- CreateEnum
CREATE TYPE "ExerciseStatus" AS ENUM ('PENDING', 'ACTIVE', 'PASSED');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('LOCKED', 'ACTIVE', 'PASSED');

-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stageKey" TEXT NOT NULL,
    "stageIndex" INTEGER NOT NULL,
    "lessonKey" TEXT NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'LOCKED',
    "activeExerciseId" TEXT,
    "startedAt" TIMESTAMP(3),
    "passedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningExercise" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonProgressId" TEXT NOT NULL,
    "stageKey" TEXT NOT NULL,
    "lessonKey" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "rubric" JSONB NOT NULL,
    "starterCode" TEXT,
    "passScore" INTEGER NOT NULL DEFAULT 70,
    "requiredCriteriaIds" JSONB NOT NULL DEFAULT '[]',
    "status" "ExerciseStatus" NOT NULL DEFAULT 'PENDING',
    "passedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSubmission" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "staticResult" JSONB NOT NULL,
    "aiResult" JSONB NOT NULL,
    "criteriaResults" JSONB NOT NULL,
    "finalPassed" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "model" TEXT,
    "promptVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonProgress_userId_status_idx" ON "LessonProgress"("userId", "status");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_stageIndex_idx" ON "LessonProgress"("userId", "stageIndex");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_userId_lessonKey_key" ON "LessonProgress"("userId", "lessonKey");

-- CreateIndex
CREATE INDEX "LearningExercise_userId_status_idx" ON "LearningExercise"("userId", "status");

-- CreateIndex
CREATE INDEX "LearningExercise_userId_lessonKey_idx" ON "LearningExercise"("userId", "lessonKey");

-- CreateIndex
CREATE INDEX "ExerciseSubmission_userId_exerciseId_createdAt_idx" ON "ExerciseSubmission"("userId", "exerciseId", "createdAt");

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningExercise" ADD CONSTRAINT "LearningExercise_lessonProgressId_fkey" FOREIGN KEY ("lessonProgressId") REFERENCES "LessonProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSubmission" ADD CONSTRAINT "ExerciseSubmission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "LearningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
