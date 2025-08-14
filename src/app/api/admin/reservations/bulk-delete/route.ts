// ==============================
// app/api/admin/reservations/bulk-delete/route.ts
// - まとめて削除 API
// ==============================
import { NextResponse as _NextResponse } from "next/server";
import { prisma as __prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { ids } = (await req.json()) as { ids: string[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return new _NextResponse("ids is required", { status: 400 });
    }
    await __prisma.reservation.deleteMany({ where: { id: { in: ids } } });
    return _NextResponse.json({ ok: true });
  } catch (e: any) {
    return new _NextResponse(e?.message ?? "bulk delete failed", {
      status: 500,
    });
  }
}
