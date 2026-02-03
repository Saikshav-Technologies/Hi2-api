-- AlterTable
ALTER TABLE "User" ADD COLUMN "showStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "allowMessageRequests" BOOLEAN NOT NULL DEFAULT true;
