-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "importBatchId" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "importBatchId" TEXT;

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "importBatchId" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "importBatchId" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "importBatchId" TEXT;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "importBatchId" TEXT;

-- CreateTable
CREATE TABLE "ImportLog" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL,
    "importedBy" INTEGER NOT NULL,
    "undone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImportLog_batchId_key" ON "ImportLog"("batchId");

-- AddForeignKey
ALTER TABLE "ImportLog" ADD CONSTRAINT "ImportLog_importedBy_fkey" FOREIGN KEY ("importedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
