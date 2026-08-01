-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'USD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'USD';
