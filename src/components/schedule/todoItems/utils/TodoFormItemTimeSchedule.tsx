"use client";

import type { ChangeEvent, Dispatch, RefObject, SetStateAction } from "react";
import type { todoItemType } from "../ts/todoItemType";
import { memo } from "react";
import { useCheckTimeValidation } from "../hooks/useCheckTimeValidation";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";

function TodoFormItemTimeSchedule({
  todoItems,
  setTodoItems,
  validationTxtRef,
}: {
  todoItems: todoItemType;
  setTodoItems: Dispatch<SetStateAction<todoItemType>>;
  validationTxtRef?: RefObject<string>;
}) {
  const { checkTimeValidation } = useCheckTimeValidation();

  // 9:00〜21:00 まで1時間刻み
  const timeOptions = Array.from(
    { length: timeBlockEnd - timeBlockBegin },
    (_, i) => {
      const hour = i + timeBlockBegin;
      return `${String(hour).padStart(2, "0")}:00`;
    },
  );

  const handleTimeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    const newTodo = { ...todoItems, [id]: value };
    checkTimeValidation(newTodo, validationTxtRef);
    setTodoItems(newTodo);
  };

  return (
    <div className="flex justify-start gap-4">
      <label className="w-full text-left">
        <span>開始時刻</span>
        <select
          id="startTime"
          value={todoItems.startTime || "09:00"}
          onChange={handleTimeChange}
          className="w-full rounded border border-gray-300 px-1 py-1"
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>

      <label className="w-full text-left">
        <span>終了時刻</span>
        <select
          id="finishTime"
          value={todoItems.finishTime || "10:00"}
          onChange={handleTimeChange}
          className="w-full rounded border border-gray-300 px-1 py-1"
        >
          {timeOptions.map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default memo(TodoFormItemTimeSchedule);
