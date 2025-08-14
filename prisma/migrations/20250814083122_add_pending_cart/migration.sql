-- CreateTable
CREATE TABLE "PendingCart" (
    "id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingCart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingCart_createdAt_idx" ON "PendingCart"("createdAt");
