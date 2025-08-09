// app/cart/page.tsx
"use client";

import { useAtom, useSetAtom } from "jotai";
import { cartAtom } from "@/types/cart-atom";
import {
  removeFromCartAtom,
  clearCartAtom,
} from "@/components/schedule/todoItems/ts/cartActions";
import { useState } from "react";

export default function CartPage() {
  const [cart] = useAtom(cartAtom);
  const remove = useSetAtom(removeFromCartAtom);
  const clear = useSetAtom(clearCartAtom);
  const [loading, setLoading] = useState(false);

  const hasItems = cart.length > 0;

  // 決済へ進む
  const goCheckout = async () => {
    if (!hasItems || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "決済開始に失敗しました");
      window.location.assign(json.url); // Stripeへ遷移
    } catch (e: any) {
      alert(e?.message ?? "決済開始に失敗しました");
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-screen-md p-4">
      <h1 className="mb-4 text-2xl font-bold">カート</h1>

      {!hasItems ? (
        <p className="text-gray-600">カートは空です。</p>
      ) : (
        <>
          <ul className="space-y-3">
            {cart.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {item.date} / {item.rooms}
                  </div>
                  <div className="text-gray-600">
                    {item.startTime} ～ {item.finishTime}
                  </div>
                  {item.note && (
                    <div className="mt-1 text-xs text-gray-500">
                      メモ: {item.note}
                    </div>
                  )}
                </div>
                <button
                  className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                  onClick={() => remove(item.id!)}
                  disabled={loading}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-end gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300 disabled:opacity-50"
              onClick={() => {
                if (confirm("カートを空にしますか？")) clear();
              }}
              disabled={loading}
            >
              カートを空にする
            </button>

            <button
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={goCheckout}
              disabled={!hasItems || loading}
            >
              {loading ? "リダイレクト中..." : "決済へ進む"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
