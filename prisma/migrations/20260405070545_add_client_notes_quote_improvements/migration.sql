-- Add title, notes, validUntil to quotes
ALTER TABLE "quotes" ADD COLUMN "title" TEXT;
ALTER TABLE "quotes" ADD COLUMN "notes" TEXT;
ALTER TABLE "quotes" ADD COLUMN "validUntil" TIMESTAMP(3);

-- Create client_notes table
CREATE TABLE "client_notes" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_notes_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys for client_notes
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
