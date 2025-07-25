import todoStyle from "../styles/todoStyle.module.css";
import { ChangeEvent, Dispatch, memo, RefObject, SetStateAction } from "react";
import { todoItemType } from "../ts/todoItemType";
import { useCheckTimeValidation } from "../hooks/useCheckTimeValidation";
import { useHandleFormEntries } from "@/hooks/useHandleFormEntries";

function TodoFormItemTimeSchedule({ todoItems, setTodoItems, validationTxtRef }: {
    todoItems: todoItemType,
    setTodoItems: Dispatch<SetStateAction<todoItemType>>,
    validationTxtRef?: RefObject<string>
}) {
    const { checkTimeValidation } = useCheckTimeValidation();
    const { handleFormEntries } = useHandleFormEntries();

    const handleTimeSchedule: (e: ChangeEvent<HTMLInputElement>) => void = (e: ChangeEvent<HTMLInputElement>) => {
        checkTimeValidation(todoItems, validationTxtRef);
        handleFormEntries<todoItemType>(e, todoItems, setTodoItems);
    }

    return (
        <div className={todoStyle.timeSchedule}>
            <label className={todoStyle.timeLabel}><span>開始時刻</span><input id="startTime" type="time" value={
                // Safari（Mac OS）での表示及び登録機能の不具合対策
                // 以下記述でないと 12:30 で表示されてしまい、登録機能も動かなくなってしまう（※ドロップダウンリストが表示されないのはブラウザ仕様）
                todoItems.startTime?.length === 0 ?
                    '00:00' : todoItems.startTime
            } onChange={(e: ChangeEvent<HTMLInputElement>) => { handleTimeSchedule(e) }} /></label>
            <label className={todoStyle.timeLabel}><span>終了時刻</span><input id="finishTime" type="time" value={
                todoItems.finishTime?.length === 0 ?
                    '00:00' : todoItems.finishTime
            } onChange={(e: ChangeEvent<HTMLInputElement>) => { handleTimeSchedule(e) }} /></label>
        </div>
    )
}

export default memo(TodoFormItemTimeSchedule);