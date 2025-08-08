"use client";

import type { RefObject, SyntheticEvent } from "react";
import type { todoItemType } from "../ts/todoItemType";
import { memo, useMemo } from "react";
import { useRegiTodoItem } from "../hooks/useRegiTodoItem";
import { useUpdateTodoItem } from "../hooks/useUpdateTodoItem";
import { useHandleFormItems } from "../hooks/useHandleFormItems";
import { useState } from "react";

import { useSetAtom } from "jotai";
import {
  addToCartAtom,
  clearCartAtom,
} from "@/components/schedule/todoItems/ts/cartActions";

export type TodoFormItemRegiBtnProps = {
  todoItems: todoItemType;
  resetStates: () => void;
  validationTxt: string;
  validationTxtRef?: RefObject<string>;
};

function TodoFormItemRegiBtn({
  todoItems,
  resetStates,
  validationTxt,
  validationTxtRef,
}: TodoFormItemRegiBtnProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { regiTodoItem } = useRegiTodoItem();
  const { updateTodoItem } = useUpdateTodoItem();
  const { handleOpenClosedBtnClicked } = useHandleFormItems();

  const addToCart = useSetAtom(addToCartAtom);
  const clearCart = useSetAtom(clearCartAtom);

  const isBtnDisabled: boolean = useMemo(() => {
    const isValidationTxt: boolean =
      typeof typeof validationTxtRef !== "undefined" &&
      validationTxtRef!.current.length > 0;
    const inCorrectTimeSchedule: boolean =
      typeof todoItems.startTime !== "undefined" &&
      typeof todoItems.finishTime !== "undefined"
        ? parseInt(todoItems.startTime.replace(":", "")) >
          parseInt(todoItems.finishTime.replace(":", ""))
        : false;

    return isValidationTxt || inCorrectTimeSchedule;
  }, [todoItems]);

  // 編集後に edit:true のままだと誰でも編集できてしまうので false に上書き（＝再編集を行うには再度パスワード入力が必要となる）
  const adjustEditState_updateTodoItem: (todoItems: todoItemType) => void = (
    todoItems: todoItemType,
  ) => {
    const adjustEditStateTodoItems: todoItemType = {
      ...todoItems,
      edit: false,
    };
    updateTodoItem(adjustEditStateTodoItems);
  };

  // ▼ 追加：カートに追加
  const handleAddToCart = () => {
    const date = todoItems.todoID; // 正規化済み "YYYY/MM/DD" を想定
    const { rooms, startTime, finishTime } = todoItems;

    if (!date || !rooms || !startTime || !finishTime) {
      alert("date/rooms/startTime/finishTime が不足しています。");
      return;
    }

    const res = addToCart({ date, rooms, startTime, finishTime });
    if (!res?.ok) {
      alert(res?.reason ?? "カートに追加できませんでした。");
      return;
    }
    alert("カートに追加しました。");
  };

  // ▼ 追加：カート全削除
  const handleClearCart = () => {
    if (confirm("カートを空にしますか？")) {
      clearCart();
      alert("カートを空にしました。");
    }
  };

  return (
    <div className="space-y-2">
      <button
        className={`relative w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50`}
        type="button"
        disabled={isBtnDisabled || isSubmitting}
        onClick={async (btnEl) => {
          setIsSubmitting(true);
          //setValidationTxt("");

          // 登録中にウェイトを入れることでボタンの表示を再レンダリング
          await regiTodoItem(todoItems);
          await new Promise((res) => setTimeout(res, 500));

          handleOpenClosedBtnClicked(btnEl.currentTarget);
          resetStates();
          setIsSubmitting(false);
        }}
      >
        {isSubmitting ? "登録中..." : "登録"}
        {typeof validationTxtRef !== "undefined" &&
          validationTxtRef.current.length > 0 && (
            <span>{validationTxtRef.current}</span>
          )}
      </button>
      {/* ▼ 追加：カート関連ボタン */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-100"
        >
          カートに追加
        </button>
        <button
          type="button"
          onClick={handleClearCart}
          className="flex-1 rounded border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
        >
          カート全削除
        </button>
      </div>
    </div>
  );
}

export default memo(TodoFormItemRegiBtn);
