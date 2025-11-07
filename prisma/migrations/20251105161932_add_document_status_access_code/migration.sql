-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('draft', 'final');

-- AlterTable
ALTER TABLE "documents"
ADD COLUMN     "status" "DocumentStatus" NOT NULL DEFAULT 'draft',
ADD COLUMN     "access_code" VARCHAR(255);
