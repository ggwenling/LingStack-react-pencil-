-- CreateTable
CREATE TABLE "LearningNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LearningNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningNote_userId_updatedAt_idx" ON "LearningNote"("userId", "updatedAt");

-- AddForeignKey
ALTER TABLE "LearningNote" ADD CONSTRAINT "LearningNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
