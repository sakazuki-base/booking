import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });
  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation not found" },
      { status: 404 },
    );
  }

  // 既存コードと重複しないランダム6桁生成
  let code: string;

  while (true) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await prisma.reservation.findFirst({
      where: { unlockCode: code },
    });
    if (!exists) break;
  }

  const dateStr = reservation.todoID.replace(/\//g, "-"); // "2025-08-18"
  const startDate = new Date(`${dateStr}T${reservation.startTime}:00`);
  const finishDate = new Date(`${dateStr}T${reservation.finishTime}:00`);
  const codeStartTime = new Date(startDate.getTime() - 15 * 60 * 1000);
  const codeFinishTime = new Date(finishDate.getTime() + 15 * 60 * 1000);

  await prisma.reservation.update({
    where: { id },
    data: { unlockCode: code, codeStartTime, codeFinishTime },
  });

  return NextResponse.json({ code, codeStartTime, codeFinishTime });
}
