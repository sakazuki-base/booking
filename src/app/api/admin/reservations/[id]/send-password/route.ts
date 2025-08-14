import { NextResponse } from "next/server";
export const runtime = "nodejs"; // Nodemailer 利用のため Edge ではなく Node で実行
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

// リクエストボディの型
type SendPasswordBody = { to?: string };

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  // Next.js 15+: params は Promise。利用前に await が必要
  const { id } = await ctx.params;

  try {
    const { to } = (await req.json()) as SendPasswordBody;
    if (!to) return new NextResponse('missing "to"', { status: 400 });

    // env チェック
    assertSMTPEnv();

    // 予約取得
    const r = await prisma.reservation.findUnique({ where: { id } });
    if (!r) return new NextResponse("reservation not found", { status: 404 });

    // SMTP トランスポート作成
    const port = Number(process.env.SMTP_PORT ?? 587);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 のときは secure
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });

    const subject = "ご予約内容のお知らせ";
    const text = buildPasswordMail({
      person: r.person ?? "ご担当者",
      room: r.rooms ?? "",
      startTime: String(r.startTime ?? ""),
      finishTime: String(r.finishTime ?? ""),
      password: String(r.pw ?? ""),
      notes: r.todoContent ?? "",
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "send failed", { status: 500 });
  }
}

function assertSMTPEnv() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.MAIL_FROM
  ) {
    throw new Error("SMTP_HOST/SMTP_PORT/MAIL_FROM are required");
  }
}

function buildPasswordMail(args: {
  person: string;
  room: string;
  startTime: string;
  finishTime: string;
  password: string;
  notes?: string;
}) {
  const { person, room, startTime, finishTime, password, notes } = args;
  return `${person} 様

ご予約内容をお知らせします。

ご予約の日時：${startTime} 〜 ${finishTime}
ご予約の種類：${room}
キーパッドの解錠パスワードは「${password}」
有効期限は、○○～○○までです。 
${
  notes
    ? `
【備考】
${notes}
`
    : ""
}本メールにお心当たりがない場合は破棄してください。`;
}
