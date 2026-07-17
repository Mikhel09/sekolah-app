-- AlterTable
ALTER TABLE "ExamResult" ADD COLUMN     "isFullyGraded" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tabSwitchCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
ALTER COLUMN "optionA" DROP NOT NULL,
ALTER COLUMN "optionB" DROP NOT NULL,
ALTER COLUMN "optionC" DROP NOT NULL,
ALTER COLUMN "optionD" DROP NOT NULL,
ALTER COLUMN "correctAnswer" DROP NOT NULL;

-- CreateTable
CREATE TABLE "EssayAnswer" (
    "id" SERIAL NOT NULL,
    "examResultId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "answerText" TEXT NOT NULL,
    "score" DOUBLE PRECISION,

    CONSTRAINT "EssayAnswer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EssayAnswer" ADD CONSTRAINT "EssayAnswer_examResultId_fkey" FOREIGN KEY ("examResultId") REFERENCES "ExamResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EssayAnswer" ADD CONSTRAINT "EssayAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
