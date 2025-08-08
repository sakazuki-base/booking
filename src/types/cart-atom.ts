"use client"; // localStorageはクライアントサイドで使用

import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import type { cartItemType } from "@/components/schedule/todoItems/ts/cartItemType";

// ストレージキーとバージョン（将来の移行用）
const STORAGE_KEY = "reservation-cart:v1";

// Next.js SSR対策: サーバーでは storage を渡さない
const storage =
  typeof window !== "undefined"
    ? createJSONStorage<cartItemType[]>(() => localStorage)
    : undefined;

// 永続カート本体
export const cartAtom = atomWithStorage<cartItemType[]>(
  STORAGE_KEY, // 保存場所のキー
  [], // 初期値(空配列)
  storage, // SSR時はundefine->CSRで自動復元
  { getOnInit: false }, // 初期描画は[]でOK。CSRで差し替え(Hydrationミスマッチを避けるため)
);

// バッチ用のカウント
export const cartCountAtom = atom((get) => get(cartAtom).length);

// 重複データをカートに入れないためのキー作成
export const cartKey = (
  i: Pick<cartItemType, "rooms" | "date" | "startTime" | "finishTime">,
) => `${i.rooms}__${i.date}__${i.startTime}__${i.finishTime}`;

// 日付ごとにグループ化（カート画面の整列用）
export const cartGroupedByDateAtom = atom((get) => {
  const map = new Map<string, cartItemType[]>();
  for (const item of get(cartAtom)) {
    const arr = map.get(item.date) ?? [];
    arr.push(item);
    map.set(item.date, arr);
  }
  return map; // Map<YYYY/MM/DD, CartItem[]>
});
