import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { todoItemType } from "@/components/schedule/todoItems/ts/todoItemType";

// GET
export async function GET() {
  const reservations = await prisma.reservation.findMany();
  return NextResponse.json(reservations);
}

// POST
export async function POST(request: Request) {
  const data: todoItemType = await request.json();

  const reservation = await prisma.reservation.create({
    /**
     * POST 操作において id は記述不要
     * prisma\schema.prisma で主キーとして id（uuid）を指定しているので data 内に記述すると重複処理でエラーとなる
     */
    data: {
      todoID: data.todoID,
      todoContent: data.todoContent,
      edit: data.edit,
      pw: data.pw,
      person: typeof data.person !== "undefined" ? data.person : "",
      rooms: typeof data.rooms !== "undefined" ? data.rooms : "",
      startTime: typeof data.startTime !== "undefined" ? data.startTime : "",
      finishTime: typeof data.finishTime !== "undefined" ? data.finishTime : "",
    },
  });

  return NextResponse.json(reservation);
}
