-- Post metadata overhaul: caption/mediaUrls, idempotency, soft delete
-- Uses safe renames/backfills to preserve existing content and imageUrl data.

-- 1) Keep existing content as caption
ALTER TABLE "Post" RENAME COLUMN "content" TO "caption";

-- 2) Add new columns
ALTER TABLE "Post"
  ADD COLUMN "mediaUrls" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN "idempotencyKey" TEXT,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

-- 3) Backfill mediaUrls from legacy imageUrl
UPDATE "Post"
SET "mediaUrls" = ARRAY_REMOVE(ARRAY["imageUrl"], NULL);

-- 4) Drop legacy imageUrl column
ALTER TABLE "Post" DROP COLUMN "imageUrl";

-- 5) Add unique constraint for idempotent create
CREATE UNIQUE INDEX "Post_idempotencyKey_key" ON "Post"("idempotencyKey");
