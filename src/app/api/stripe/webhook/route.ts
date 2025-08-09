import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

// 必要なら型
type CartItem = {
  rooms: string;
  date: string; // "YYYY/MM/DD"
  startTime: string; // "HH:MM"
  finishTime: string; // "HH:MM"
  note?: string;
};

// （例）DB登録（あなたの既存APIに合わせて書き換え）
async function registerReservation(i: CartItem) {
  const payload = {
    // あなたの todoItemType に合わせて生成
    id: crypto.randomUUID(),
    todoID: i.date,
    rooms: i.rooms,
    startTime: i.startTime,
    finishTime: i.finishTime,
    todoContent: i.note ?? "",
    edit: false,
    pw: "",
  };

  // 予約重複は DBレベルのユニーク制約 or API側で弾くのが安全
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/reservations`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Webhook はサーバ内からの呼び出しなので相対より絶対URLが安全
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Reservation failed: ${res.status} ${res.statusText} ${t}`);
  }
}

// App Router では raw body を自分で取り出す
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      // 1) metadata からカート復元（MVP想定）
      const payloadStr = session?.metadata?.payload ?? "[]";
      const items: CartItem[] = JSON.parse(payloadStr);

      // 2) Idempotency（多重処理防止）
      //  - 本番では「events」テーブル等に event.id を保存して二重取込を防止すること
      //  - ここではサンプルのため省略（コメントだけ残します）

      // 3) 予約を登録（逐次）
      for (const item of items) {
        await registerReservation(item);
      }

      // 4) 正常終了
      return NextResponse.json({ received: true });
    }

    // 他イベントは “受領” のみ
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message);
    // Stripeは5xxを再送トリガに使うため、再試行してほしい場合は500を返す
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
