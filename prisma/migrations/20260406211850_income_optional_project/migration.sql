-- Make projectId and clientId optional on incomes
ALTER TABLE "incomes" ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE "incomes" ALTER COLUMN "clientId" DROP NOT NULL;

-- Add description field for "other" type incomes
ALTER TABLE "incomes" ADD COLUMN "description" TEXT;
