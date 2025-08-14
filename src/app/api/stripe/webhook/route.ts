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

      // ▼ メール取得のフォールバック（新: customer_details.email / 旧: customer_email / 最後に customer から取得）
      let email: string | null =
        session.customer_details?.email ??
        ((session as any).customer_email as string | undefined) ??
        null;
      if (!email && session.customer) {
        try {
          const cust = await stripe.customers.retrieve(
            session.customer as string,
          );
          if (!("deleted" in cust)) email = cust.email ?? null;
        } catch {}
      }

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

      // ---- カート復元（cartId 優先 / 互換: payload）----
      let items: CartItem[] = [];
      let cartIdForCleanup: string | undefined;
      try {
        const cartId = session.metadata?.cartId ?? "";
        if (cartId) {
          const cart = await prisma.pendingCart.findUnique({
            where: { id: cartId },
            select: { items: true },
          });
          if (!cart) throw new Error("PendingCart not found");
          const arr = cart.items as unknown;
          if (!Array.isArray(arr)) throw new Error("items is not array");
          items = arr as CartItem[];
          cartIdForCleanup = cartId;
        } else {
          // 互換: 旧payload方式（500文字制限に注意）
          const s = session.metadata?.payload ?? "[]";
          if (s.length > 500) throw new Error("metadata.payload too long");
          const arr = JSON.parse(s);
          if (!Array.isArray(arr)) throw new Error("payload is not array");
          items = arr as CartItem[];
        }
      } catch (e: any) {
        await prisma.stripeEventLog.update({
          where: { id: event.id },
          data: {
            status: "ERROR",
            processedAt: new Date(),
            error: `cart restore: ${e?.message}`,
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
                email,
                pw: "",
                person: session.customer_details?.name ?? "",
                stripeSessionId: session.id, // 監査用
              },
            });
          }
        });
        // （任意）後片付け：取り込みに成功したら PendingCart を削除
        try {
          if (cartIdForCleanup) {
            await prisma.pendingCart.delete({
              where: { id: cartIdForCleanup },
            });
          }
        } catch {}

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

        // （任意）取り込み成功後に PendingCart を削除（テーブル肥大防止）
        try {
          const cartId = session.metadata?.cartId;
          if (cartId) {
            await prisma.pendingCart.delete({
              where: { id: cartId },
            });
          }
        } catch {}

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

    // ===== 追加: payment_intent.succeeded を処理 =====
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;

      // email / name を Customer/Charge から復元
      let email: string | null = null;
      let person = "";
      if (pi.customer) {
        try {
          const cust = await stripe.customers.retrieve(pi.customer as string);
          if (!("deleted" in cust)) {
            email = cust.email ?? null;
            person = cust.name ?? "";
          }
        } catch {}
      }
      if ((!email || !person) && typeof pi.latest_charge === "string") {
        try {
          const ch = await stripe.charges.retrieve(pi.latest_charge);
          if (!email)
            email = ch.billing_details?.email ?? ch.receipt_email ?? null;
          if (!person) person = ch.billing_details?.name ?? "";
        } catch {}
      }

      // カート復元（必須: pi.metadata.cartId）
      let items: CartItem[] = [];
      let cartIdForCleanup: string | undefined;
      try {
        const cartId = pi.metadata?.cartId ?? "";
        if (!cartId) throw new Error("metadata.cartId is empty");
        const cart = await prisma.pendingCart.findUnique({
          where: { id: cartId },
          select: { items: true },
        });
        if (!cart) throw new Error("PendingCart not found");
        const arr = cart.items as unknown;
        if (!Array.isArray(arr)) throw new Error("items is not array");
        items = arr as CartItem[];
        cartIdForCleanup = cartId;
      } catch (e: any) {
        await prisma.stripeEventLog.update({
          where: { id: event.id },
          data: {
            status: "ERROR",
            processedAt: new Date(),
            error: `cart restore (PI): ${e?.message}`,
          },
        });
        return NextResponse.json({ received: true });
      }

      // 予約作成
      try {
        await prisma.$transaction(async (tx) => {
          for (const i of items) {
            await tx.reservation.create({
              data: {
                todoID: i.date,
                rooms: i.rooms,
                startTime: i.startTime,
                finishTime: i.finishTime,
                todoContent: i.note ?? "",
                edit: false,
                email,
                pw: "",
                person,
                // 監査用: セッションではなく PI の id を保存
                stripeSessionId: pi.id,
              },
            });
          }
        });

        // （任意）成功後に PendingCart を削除
        try {
          if (cartIdForCleanup) {
            await prisma.pendingCart.delete({
              where: { id: cartIdForCleanup },
            });
          }
        } catch {}

        await prisma.stripeEventLog.update({
          where: { id: event.id },
          data: { status: "PROCESSED", processedAt: new Date() },
        });
        return NextResponse.json({ received: true });
      } catch (e: any) {
        if (e.code === "P2002") {
          await prisma.stripeEventLog.update({
            where: { id: event.id },
            data: {
              status: "SKIPPED",
              processedAt: new Date(),
              error: "slot already taken (P2002, PI)",
            },
          });
          return NextResponse.json({ received: true });
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
          { error: "Webhook processing failed (PI)" },
          { status: 500 },
        );
      }
    }
    // ===== ここまで追加 =====

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
