// src/app/api/admin/reservations/[id]/send-password/route.ts
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
    // env チェック
    assertSMTPEnv();

    // 予約取得
    const r = await prisma.reservation.findUnique({ where: { id } });
    if (!r) return new NextResponse("reservation not found", { status: 404 });

    // リクエスト body の "to" が優先。無ければ DB の r.email を使う
    const body = (await safeJson<SendPasswordBody>(req)) ?? {};
    const to = (body.to ?? r.email ?? "").trim();
    if (!to) return new NextResponse('missing "to"', { status: 400 });

    // MAIL_FROM からアドレス/ドメイン/表示名を抽出
    const fromParsed = parseFrom(process.env.MAIL_FROM!);
    const mailDomain = fromParsed.domain ?? "example.com";
    const bounceEnv = (process.env.MAIL_BOUNCE_FROM ?? "").trim();
    const replyTo = (process.env.MAIL_REPLY_TO ?? "").trim() || undefined;

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
      // 任意: EHLO 名を指定したい場合
      name: process.env.SMTP_EHLO_NAME || undefined,
    });

    const subject = "ご予約内容のお知らせ";
    const text = buildPasswordMail({
      person: r.person ?? "ご担当者",
      room: r.rooms ?? "",
      date: r.todoID,
      startTime: String(r.startTime ?? ""),
      finishTime: String(r.finishTime ?? ""),
      password: String(r.unlockCode ?? ""),
      codeStartTime: r.codeStartTime,
      codeFinishTime: r.codeFinishTime,
    });

    // localhost を避けるため自ドメインで Message-ID を生成
    const messageId = buildMessageId(mailDomain);

    await transporter.sendMail({
      from: fromParsed.name
        ? { name: fromParsed.name, address: fromParsed.address }
        : fromParsed.address,
      to,
      subject,
      text,
      // これが Return-Path（バウンス先）。自ドメインに統一
      // MAIL_BOUNCE_FROM を設定している時だけ Return-Path を固定
      ...(bounceEnv ? { envelope: { from: bounceEnv, to } } : {}),
      messageId,
      replyTo,
      headers: {
        // 任意: 自動応答抑止ヘッダ（品質向上用）
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
      },
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

// JSON を安全に読む（空ボディなどで throw しない）
async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

// "表示名 <user@domain>" / "user@domain" のどちらにも対応して抽出
function parseFrom(input: string): {
  address: string;
  domain?: string;
  name?: string;
} {
  const trimmed = input.trim();
  const m = trimmed.match(/^(?:"?([^"]+)"?\s*)?<([^>]+)>$/);
  if (m) {
    const address = m[2]!.trim();
    const name = (m[1] || "").trim() || undefined;
    const domain = address.split("@")[1];
    return { address, domain, name };
  }
  const address = trimmed;
  const domain = address.includes("@") ? address.split("@")[1] : undefined;
  return { address, domain, name: undefined };
}

function buildMessageId(domain: string): string {
  const rand = Math.random().toString(16).slice(2);
  return `<${Date.now()}.${rand}@${domain}>`;
}

function buildPasswordMail(args: {
  person: string;
  room: string;
  date: string;
  startTime: string;
  finishTime: string;
  password: string;
  codeStartTime?: Date | null;
  codeFinishTime?: Date | null;
}) {
  const {
    person,
    room,
    date,
    startTime,
    finishTime,
    password,
    codeStartTime,
    codeFinishTime,
  } = args;

  const fmt = (d?: Date | null) =>
    d
      ? d.toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" })
      : "未設定";

  return `${person} 様

ご予約内容をお知らせします。

ご予約の日時：${date} ${startTime} 〜 ${finishTime}
ご予約の種類：${room}
キーパッドの解錠パスワードは「${password}」
有効期限は、${fmt(codeStartTime)} 〜 ${fmt(codeFinishTime)} です。
`;
}
