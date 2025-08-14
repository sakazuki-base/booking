import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// カートの1行の型（最低限）
type CartItem = {
  id: string; // cart行のクライアントID（DBでは不要）
  rooms: string;
  date: string; // "YYYY/MM/DD"
  startTime: string; // "HH:MM"
  finishTime: string; // "HH:MM"
  note?: string;
};

// 料金ロジック（例：1枠=1000円）
const calcAmount = (_: CartItem) => 1500;

export async function POST(req: Request) {
  try {
    const { cart } = (await req.json()) as { cart: CartItem[] };

    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: "カートが空です" }, { status: 400 });
    }

    const line_items = cart.map((i) => ({
      quantity: 1,
      price_data: {
        currency: "jpy",
        unit_amount: calcAmount(i),
        product_data: {
          name: `${i.rooms} / ${i.date} ${i.startTime}〜${i.finishTime}`,
        },
      },
    }));

    const origin =
      req.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL!;

    // 1) カートをDBに一時保存（metadataに大きなJSONを入れない）
    const pending = await prisma.pendingCart.create({
      data: { items: cart as unknown as Prisma.InputJsonValue },
      select: { id: true },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      // 2) metadata は cartId のみ（500文字制限を回避）
      metadata: { cartId: pending.id },
      // 3) 将来 payment_intent.succeeded を使う場合にも拾えるように同じ cartId を付与
      payment_intent_data: { metadata: { cartId: pending.id } },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e.message ?? "checkout error" },
      { status: 500 },
    );
  }
}
