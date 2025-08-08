// app/cart/page.tsx
"use client";

import { useAtom, useSetAtom } from "jotai";
import { cartAtom } from "@/types/cart-atom";
import {
  removeFromCartAtom,
  clearCartAtom,
} from "@/components/schedule/todoItems/ts/cartActions";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function CartPage() {
  const [cart] = useAtom(cartAtom);
  const remove = useSetAtom(removeFromCartAtom);
  const clear = useSetAtom(clearCartAtom);
  const [submitting, setSubmitting] = useState(false);

  const hasItems = cart.length > 0;

  // まとめて登録
  const handleRegisterAll = async () => {
    if (!hasItems) return;
    if (!confirm("カート内の予約をすべて登録します。よろしいですか？")) return;

    try {
      setSubmitting(true);

      const failures: string[] = [];
      for (const item of cart) {
        // API が期待する形（todoItemType 相当）に整形
        const payload = {
          id: uuidv4(),
          todoID: item.date, // "YYYY/MM/DD"
          rooms: item.rooms,
          startTime: item.startTime!,
          finishTime: item.finishTime!,
          todoContent: item.note ?? "", // 任意フィールドは空でOK
          edit: false,
          pw: "",
        };

        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          failures.push(
            `${item.date} ${item.rooms} ${item.startTime}～${item.finishTime}`,
          );
        }
      }

      if (failures.length === 0) {
        alert("すべて登録できました。");
        clear(); // カートを空に
      } else {
        alert(
          `一部の登録に失敗しました：\n- ${failures.join("\n- ")}\n\nページを更新して状況を確認してください。`,
        );
      }
    } catch (e) {
      console.error(e);
      alert("登録中にエラーが発生しました。通信状況をご確認ください。");
    } finally {
      setSubmitting(false);
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
                  className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
                  onClick={() => remove(item.id!)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col items-end gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
              onClick={() => {
                if (confirm("カートを空にしますか？")) clear();
              }}
              disabled={submitting}
            >
              カートを空にする
            </button>

            <button
              className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              onClick={handleRegisterAll}
              disabled={submitting}
            >
              {submitting ? "登録中..." : "すべて登録"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
