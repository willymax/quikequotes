-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "taxRatePercent" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "taxRatePercent" DECIMAL(5,2) NOT NULL DEFAULT 0;
