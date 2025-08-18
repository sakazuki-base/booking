import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  // 予約取得
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r || !r.unlockCode || !r.codeStartTime || !r.codeFinishTime) {
    return NextResponse.json({ error: "パスコード情報不足" }, { status: 400 });
  }

  // 秒単位に変換
  const startTime = Math.floor(r.codeStartTime.getTime() / 1000);
  const endTime = Math.floor(r.codeFinishTime.getTime() / 1000);

  const token = process.env.SWITCHBOT_TOKEN!;
  const deviceId = process.env.SWITCHBOT_DEVICE_ID!;

  const res = await fetch(
    `https://api.switch-bot.com/v1.1/devices/${deviceId}/commands`,
    {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        commandType: "command",
        command: "createKey",
        parameter: {
          name: `予約者用パスコード${r.unlockCode}`,
          type: "timeLimit",
          password: r.unlockCode,
          startTime,
          endTime,
        },
      }),
    },
  );

  const result = await res.json();

  return NextResponse.json(result);
}
