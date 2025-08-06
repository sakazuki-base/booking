import type { RefObject } from "react";
import type { todoItemType } from "../ts/todoItemType";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";
import { useCheckTimeBlockEntryForm } from "./useCheckTimeBlockEntryForm";

export const useCheckTimeValidation = () => {
  const { checkTimeBlockEntryForm, checkTimeSchedule } =
    useCheckTimeBlockEntryForm();

  const checkTimeValidation: (
    todoItems: todoItemType,
    validationTxtRef?: RefObject<string>,
  ) => void = (
    todoItems: todoItemType,
    validationTxtRef?: RefObject<string>,
  ) => {
    if (
      typeof todoItems.startTime !== "undefined" &&
      typeof todoItems.finishTime !== "undefined" &&
      typeof validationTxtRef !== "undefined"
    ) {
      validationTxtRef.current = "";

      const isCheckTimeSchedule_start: boolean = checkTimeSchedule(
        todoItems.startTime,
        todoItems,
      );

      const isCheckTimeSchedule_finish: boolean = checkTimeSchedule(
        todoItems.finishTime,
        todoItems,
      );

      if (isCheckTimeSchedule_start || isCheckTimeSchedule_finish) {
        validationTxtRef.current = "他の方が既に予約済みです";
      }

      if (todoItems.startTime == todoItems.finishTime) {
        validationTxtRef.current = "開始時間と終了時間が同じです";
      }

      const isCheckTimeBlockEntryForm_start: boolean = checkTimeBlockEntryForm(
        todoItems.startTime,
      );

      const isCheckTimeBlockEntryForm_finish: boolean = checkTimeBlockEntryForm(
        todoItems.finishTime,
      );

      if (isCheckTimeBlockEntryForm_start || isCheckTimeBlockEntryForm_finish) {
        validationTxtRef.current = `「${timeBlockBegin}時〜${timeBlockEnd}時」の時間帯で指定してください`;
      }
    }
  };

  return { checkTimeValidation };
};
