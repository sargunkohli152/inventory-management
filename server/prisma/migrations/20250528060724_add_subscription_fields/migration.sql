-- AlterTable
ALTER TABLE "AdminUsers" ADD COLUMN     "hasAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceId" TEXT;
