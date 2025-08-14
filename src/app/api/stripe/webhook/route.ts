// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // ← type ではなく値として import

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// apiVersion は未指定（パッケージ既定を使用）。固定したい場合は "2024-06-20" など実在する文字列を。
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

type CartItem = {
  rooms: string;
  date: string; // "YYYY/MM/DD"
  startTime: string; // "HH:MM"
  finishTime: string; // "HH:MM"
  note?: string;
};

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  // 署名検証は生バイトが必要
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(raw),
      sig,
      endpointSecret,
    );
  } catch (err: any) {
    console.error("Signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ---- 冪等化：同じ event.id があればスキップ ----
  const existed = await prisma.stripeEventLog.findUnique({
    where: { id: event.id },
  });
  if (existed) {
    await prisma.stripeEventLog.update({
      where: { id: event.id },
      data: { retryCount: { increment: 1 }, status: "SKIPPED" },
    });
    return NextResponse.json({ received: true });
  }

  // payload を JSON として保存（null のときは Prisma.JsonNull を使う）
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = raw; // 稀にJSONでない場合は生文字列で保存
  }

  // ← ここがポイント：変数に落とさず、Union のままプロパティに直接渡す
  await prisma.stripeEventLog.create({
    data: {
      id: event.id,
      type: event.type,
      apiVersion: event.api_version ?? null,
      account: event.account ?? null,
      created: new Date(event.created * 1000),
      payload:
        parsed === null ? Prisma.JsonNull : (parsed as Prisma.InputJsonValue),
      signature: sig,
      // status/receivedAt/retryCount はデフォルト
    },
  });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        await prisma.stripeEventLog.update({
          where: { id: event.id },
          data: {
            status: "SKIPPED",
            processedAt: new Date(),
            error: "payment_status != paid",
          },
        });
        return NextResponse.json({ received: true });
      }

      // ---- metadata からカート復元（将来は cartId 方式推奨）----
      let items: CartItem[] = [];
      try {
        const s = session.metadata?.payload ?? "[]";
        if (s.length > 500) throw new Error("metadata.payload too long");
        items = JSON.parse(s);
        if (!Array.isArray(items)) throw new Error("payload is not array");
      } catch (e: any) {
        await prisma.stripeEventLog.update({
          where: { id: event.id },
          data: {
            status: "ERROR",
            processedAt: new Date(),
            error: `payload parse: ${e?.message}`,
          },
        });
        return NextResponse.json({ received: true }); // 再送しても直らないので200
      }

      // ---- 予約作成（DBユニーク制約で同時予約を防御）----
      try {
        await prisma.$transaction(async (tx) => {
          for (const i of items) {
            await tx.reservation.create({
              data: {
                todoID: i.date, // 将来は ISO/Date 型を別カラムで持つのが理想
                rooms: i.rooms,
                startTime: i.startTime,
                finishTime: i.finishTime,
                todoContent: i.note ?? "",
                edit: false,
                pw: "",
                person: session.customer_details?.name ?? "", // 必須フィールド
                stripeSessionId: session.id, // 監査用
              },
            });
          }
        });

        await prisma.stripeEventLog.update({
          where: { id: event.id },
          data: { status: "PROCESSED", processedAt: new Date() },
        });
        return NextResponse.json({ received: true });
      } catch (e: any) {
        if (e.code === "P2002") {
          // 競合（既に埋まっている）
          const pi = session.payment_intent as string | null;
          if (pi) {
            try {
              await stripe.refunds.create({ payment_intent: pi });
            } catch {}
          }
          await prisma.stripeEventLog.update({
            where: { id: event.id },
            data: {
              status: "SKIPPED",
              processedAt: new Date(),
              error: "slot already taken (P2002)",
            },
          });
          return new NextResponse("Slot already taken", { status: 409 });
        }

        await prisma.stripeEventLog.update({
          where: { id: event.id },
          data: {
            status: "ERROR",
            processedAt: new Date(),
            error: String(e?.message ?? e),
          },
        });
        return NextResponse.json(
          { error: "Webhook processing failed" },
          { status: 500 },
        );
      }
    }

    // 対象外イベント
    await prisma.stripeEventLog.update({
      where: { id: event.id },
      data: {
        status: "SKIPPED",
        processedAt: new Date(),
        error: "ignored event type",
      },
    });
    return NextResponse.json({ received: true });
  } catch (e: any) {
    // 想定外例外もログへ
    await prisma.stripeEventLog.update({
      where: { id: event.id },
      data: {
        status: "ERROR",
        processedAt: new Date(),
        error: String(e?.message ?? e),
      },
    });
    return NextResponse.json({ error: "Unhandled error" }, { status: 500 });
  }
}
