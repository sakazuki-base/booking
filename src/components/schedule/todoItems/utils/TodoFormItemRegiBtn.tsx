"use client";

import type { RefObject, SyntheticEvent } from "react";
import type { todoItemType } from "../ts/todoItemType";
import { memo, useMemo } from "react";
import { useCloseModalWindow } from "../hooks/useCloseModalWindow";
import { useRegiTodoItem } from "../hooks/useRegiTodoItem";
import { useUpdateTodoItem } from "../hooks/useUpdateTodoItem";
import { useHandleFormItems } from "../hooks/useHandleFormItems";

function TodoFormItemRegiBtn({
  todoItems,
  resetStates,
  validationTxtRef,
}: {
  todoItems: todoItemType;
  resetStates: () => void;
  validationTxtRef?: RefObject<string>;
}) {
  const { closeModalWindow } = useCloseModalWindow();
  const { regiTodoItem } = useRegiTodoItem();
  const { updateTodoItem } = useUpdateTodoItem();
  const { handleOpenClosedBtnClicked } = useHandleFormItems();

  const isBtnDisabled: boolean = useMemo(() => {
    const isValidationTxt: boolean =
      typeof validationTxtRef !== "undefined" &&
      validationTxtRef.current.length > 0;
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

  return (
    <button
      className={`relative w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50`}
      type="button"
      disabled={isBtnDisabled}
      onClick={(btnEl: SyntheticEvent<HTMLButtonElement>) => {
        if (!todoItems.edit) {
          regiTodoItem(todoItems);
          handleOpenClosedBtnClicked(btnEl.currentTarget);
        } else {
          btnEl.stopPropagation(); // 親要素のクリックイベント（OnViewModalWindow）発生を防止
          adjustEditState_updateTodoItem(todoItems);
          closeModalWindow();
        }
        resetStates();
      }}
    >
      {!todoItems.edit ? "登録" : "再登録"}
      {typeof validationTxtRef !== "undefined" &&
        validationTxtRef.current.length > 0 && (
          <span>{validationTxtRef.current}</span>
        )}
    </button>
  );
}

export default memo(TodoFormItemRegiBtn);
