-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "email" TEXT,
ADD COLUMN     "unlockCode" TEXT;

-- CreateIndex
CREATE INDEX "Reservation_email_idx" ON "Reservation"("email");
