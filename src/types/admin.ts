import type { Reservation } from "@prisma/client";

export type AdminReservationRow = Omit<
  Reservation,
  "createdAt" | "updatedAt"
> & {
  createdAt: string; // ISO文字列
  updatedAt: string; // ISO文字列
};
