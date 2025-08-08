"use client";

import type { RefObject, SyntheticEvent } from "react";
import type { todoItemType } from "../ts/todoItemType";
import { memo, useMemo } from "react";
import { useHandleFormItems } from "../hooks/useHandleFormItems";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { addToCartAtom } from "@/components/schedule/todoItems/ts/cartActions";

export type TodoFormItemRegiBtnProps = {
  todoItems: todoItemType;
  resetStates: () => void;
  validationTxt: string;
  validationTxtRef?: RefObject<string>;
  onClose?: () => void;
};

function TodoFormItemRegiBtn({
  todoItems,
  resetStates,
  validationTxt,
  validationTxtRef,
  onClose,
}: TodoFormItemRegiBtnProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleOpenClosedBtnClicked } = useHandleFormItems();
  const addToCart = useSetAtom(addToCartAtom);

  // ボタンの活性制御
  const isBtnDisabled: boolean = useMemo(() => {
    const hasValidationMsg =
      typeof validationTxtRef !== "undefined" &&
      !!validationTxtRef.current &&
      validationTxtRef.current.length > 0;

    const inCorrectTimeSchedule =
      typeof todoItems.startTime !== "undefined" &&
      typeof todoItems.finishTime !== "undefined"
        ? parseInt(todoItems.startTime.replace(":", "")) >
          parseInt(todoItems.finishTime.replace(":", ""))
        : false;

    return hasValidationMsg || inCorrectTimeSchedule;
  }, [todoItems, validationTxtRef]);

  // カートへ追加
  const handleAddToCart = async (btnEl: HTMLButtonElement) => {
    setIsSubmitting(true);

    const date = todoItems.todoID; // "YYYY/MM/DD"
    const { rooms, startTime, finishTime } = todoItems;

    if (!date || !rooms || !startTime || !finishTime) {
      alert("date / rooms / startTime / finishTime を入力してください。");
      setIsSubmitting(false);
      return;
    }

    const res = addToCart({ date, rooms, startTime, finishTime });
    if (!res?.ok) {
      alert(res?.reason ?? "カートに追加できませんでした。");
      setIsSubmitting(false);
      return;
    }

    // 従来と同様にフォームを閉じたり初期化したい場合は維持
    //handleOpenClosedBtnClicked(btnEl);
    resetStates();

    setIsSubmitting(false);
    alert("カートに追加しました。");
    onClose?.();
  };

  return (
    <div className="space-y-2">
      <button
        className="relative w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        type="button"
        disabled={isBtnDisabled || isSubmitting}
        onClick={(e) => handleAddToCart(e.currentTarget)}
      >
        {isSubmitting ? "処理中..." : "カートに追加"}
        {typeof validationTxtRef !== "undefined" &&
          validationTxtRef.current &&
          validationTxtRef.current.length > 0 && (
            <span className="ml-2">{validationTxtRef.current}</span>
          )}
      </button>
    </div>
  );
}

export default memo(TodoFormItemRegiBtn);
