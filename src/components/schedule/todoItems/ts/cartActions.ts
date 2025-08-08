"use client";

import { atom } from "jotai";
import { v4 as uuidv4 } from "uuid";
import { cartAtom, cartKey } from "@/types/cart-atom";
import type { cartItemType } from "@/components/schedule/todoItems/ts/cartItemType";

/**
 * カートに追加
 * - 同一枠（date+rooms+start+finish）は重複追加しない
 * - 戻り値で結果を返す（UIでトースト等に使える）
 */
export const addToCartAtom = atom(
  null,
  (get, set, item: Omit<cartItemType, "id">) => {
    const list = get(cartAtom);
    const isDup = list.some((c) => cartKey(c) === cartKey(item));
    if (isDup) {
      return { ok: false, reason: "この枠はカートに入っています" };
    }
    const next = [...list, { id: uuidv4(), ...item }];
    set(cartAtom, next);
    return { ok: true };
  },
);

/**
 * カートから1件削除
 */
export const removeFromCartAtom = atom(null, (get, set, lineId: string) => {
  const next = get(cartAtom).filter((c) => c.id !== lineId);
  set(cartAtom, next);
});

/**
 * カートを空にする
 */
export const clearCartAtom = atom(null, (_get, set) => {
  set(cartAtom, []);
});

/**
 * 1件更新（部分更新）
 * - 例：メモや時間の微修正など
 */
export const updateCartItemAtom = atom(
  null,
  (
    get,
    set,
    payload: { id: string; patch: Partial<Omit<cartItemType, "id">> },
  ) => {
    const { id, patch } = payload;
    const next = get(cartAtom).map((c) =>
      c.id === id ? { ...c, ...patch } : c,
    );
    set(cartAtom, next);
  },
);

/**
 * （オプション）重複なら置き換え、無ければ追加
 * - UI側で「とにかくこの枠をカートに反映したい」ケースに便利
 */
export const upsertCartAtom = atom(
  null,
  (get, set, item: Omit<cartItemType, "id">) => {
    const list = get(cartAtom);
    const key = cartKey(item);
    const idx = list.findIndex((c) => cartKey(c) === key);

    if (idx === -1) {
      set(cartAtom, [...list, { id: uuidv4(), ...item }]);
      return { ok: true, action: "added" as const };
    }

    const replaced = [...list];
    replaced[idx] = { ...replaced[idx], ...item };
    set(cartAtom, replaced);
    return { ok: true, action: "replaced" as const };
  },
);
