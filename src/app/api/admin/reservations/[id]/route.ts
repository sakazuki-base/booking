// ==============================
// app/api/admin/reservations/[id]/route.ts
// - 単一削除 API
// ==============================
import { NextResponse } from "next/server";
import { prisma as _prisma } from "@/lib/prisma";

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  try {
    await _prisma.reservation.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "delete failed", { status: 500 });
  }
}
