// ==============================
// app/api/admin/reservations/[id]/route.ts
// - 単一削除 API
// ==============================
import { NextResponse } from "next/server";
import { prisma as _prisma } from "@/lib/prisma";

export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params; // await が必要
    await _prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "delete failed", { status: 500 });
  }
}
