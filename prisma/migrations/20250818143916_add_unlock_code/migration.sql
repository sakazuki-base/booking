-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "paid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passSent" BOOLEAN NOT NULL DEFAULT false;
