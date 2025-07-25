import { RefObject } from "react";
import { todoItemType } from "../ts/todoItemType";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";
import { useCheckTimeBlockEntryForm } from "./useCheckTimeBlockEntryForm";

export const useCheckTimeValidation = () => {
    const { checkTimeBlockEntryForm, checkTimeSchedule } = useCheckTimeBlockEntryForm();

    const checkTimeValidation: (todoItems: todoItemType, validationTxtRef?: RefObject<string>) => void = (
        todoItems: todoItemType,
        validationTxtRef?: RefObject<string>
    ) => {
        if (
            (typeof todoItems.startTime !== 'undefined' && typeof todoItems.finishTime !== 'undefined') &&
            typeof validationTxtRef !== 'undefined'
        ) {
            const isCheckTimeSchedule_start: boolean = checkTimeSchedule(todoItems.startTime, todoItems);
            const isCheckTimeSchedule_finish: boolean = checkTimeSchedule(todoItems.finishTime, todoItems);
            if (isCheckTimeSchedule_start || isCheckTimeSchedule_finish) {
                validationTxtRef.current = '他の方が既に予約済みです';
            }

            const isCheckTimeBlockEntryForm_start: boolean = checkTimeBlockEntryForm(todoItems.startTime);
            const isCheckTimeBlockEntryForm_finish: boolean = checkTimeBlockEntryForm(todoItems.finishTime);
            if (isCheckTimeBlockEntryForm_start || isCheckTimeBlockEntryForm_finish) {
                validationTxtRef.current = `「${timeBlockBegin}時〜${timeBlockEnd}時」の時間帯で指定してください`;
            }

            const isCheckTimeSchedule_FALSE: boolean = !isCheckTimeSchedule_start && !isCheckTimeSchedule_finish;
            const isCheckTimeBlockEntryForm_FALSE: boolean = !isCheckTimeBlockEntryForm_start && !isCheckTimeBlockEntryForm_finish;

            // バリデーションの初期化（ useCheckTimeBlockEntryForm の上記どちらの関数処理チェックも false かつ validationTxtRef が入力済みの場合）
            if (
                isCheckTimeSchedule_FALSE &&
                isCheckTimeBlockEntryForm_FALSE &&
                validationTxtRef.current.length > 0
            ) {
                validationTxtRef.current = '';
            }
        }
    }

    return { checkTimeValidation }
}