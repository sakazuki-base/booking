// app/cart/success/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSetAtom } from "jotai";
import { clearCartAtom } from "@/components/schedule/todoItems/ts/cartActions";

export default function CartSuccessPage() {
  const clear = useSetAtom(clearCartAtom);

  useEffect(() => {
    // 決済完了後にカートを空にする
    clear();
  }, [clear]);

  return (
    <main className="mx-auto max-w-screen-md p-6">
      <h1 className="mb-2 text-2xl font-bold">お支払いが完了しました</h1>
      <p className="text-gray-700">
        予約の登録処理が完了しました。ご利用ありがとうございました。
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
