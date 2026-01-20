-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "mediaUrls" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Post_deletedAt_idx" ON "Post"("deletedAt");
