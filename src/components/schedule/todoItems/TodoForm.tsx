"use client";

import type { ChangeEvent } from "react";
import type { todoItemType } from "./ts/todoItemType";
import { memo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { roomsAtom } from "@/types/rooms-atom";
import TodoFormItemRoom from "./utils/TodoFormItemRoom";
import TodoFormItemTimeSchedule from "./utils/TodoFormItemTimeSchedule";
import TodoFormItemRegiBtn from "./utils/TodoFormItemRegiBtn";
import { useRegiTodoItem } from "./hooks/useRegiTodoItem";
import { useUpdateTodoItem } from "./hooks/useUpdateTodoItem";
import { useScrollTop } from "@/hooks/useScrollTop";
import { useHandleFormItems } from "./hooks/useHandleFormItems";

type TodoFormType = {
  selectedDate: string;
  selectedTime: number | null;
  todoItem?: todoItemType;
};

function TodoForm({
  props,
  onClose,
}: {
  props: TodoFormType;
  onClose?: () => void;
}) {
  const { selectedDate, selectedTime, todoItem } = props;
  const [rooms] = useAtom(roomsAtom);
  const roomRef = useRef<null | HTMLSelectElement>(null);
  const validationTxtRef = useRef<string>("");

  const [year, month, day] = selectedDate.split("/").map(Number);
  const todoId = `${year}/${month!.toString().padStart(2, "0")}/${day!.toString().padStart(2, "0")}`;

  const initTodoItems: todoItemType = {
    id: todoItem ? todoItem.id : "undefined",
    todoID: todoId ? todoId : "undefined",
    todoContent: "",
    edit: todoItem ? todoItem.edit : false,
    pw: "",
    person: todoItem ? todoItem.person : "",
    rooms: roomRef.current !== null ? roomRef.current.value : rooms[0]!.room,
    startTime: selectedTime
      ? `${selectedTime.toString().padStart(2, "0")}:00`
      : "",
    finishTime: selectedTime
      ? `${(selectedTime + 1).toString().padStart(2, "0")}:00`
      : "",
  };
  const [todoItems, setTodoItems] = useState<todoItemType>(initTodoItems);

  const { regiTodoItem } = useRegiTodoItem();
  const { updateTodoItem } = useUpdateTodoItem();
  const { scrollTop } = useScrollTop();
  const { handleOpenClosedBtnClicked } = useHandleFormItems();
  const [validationTxt, setValidationTxt] = useState("");

  const resetStates: () => void = () => {
    setTodoItems(initTodoItems);
    setTimeout(() => scrollTop()); // button のクリックイベントでスクロールトップしないので回避策として疑似的な遅延処理
  };

  return (
    <form
      className="relative text-lg leading-8"
      onSubmit={(formElm: ChangeEvent<HTMLFormElement>) => {
        formElm.preventDefault();
        if (!todoItems.edit) {
          regiTodoItem(todoItems);
          handleOpenClosedBtnClicked(formElm);
        } else {
          updateTodoItem(todoItems);
        }
        resetStates();
      }}
    >
      {/* 予約室 */}
      <TodoFormItemRoom
        rooms={rooms}
        todoItems={todoItems}
        setTodoItems={setTodoItems}
        roomRef={roomRef}
        validationTxtRef={validationTxtRef}
      />

      {/* タイムテーブル（スケジュール）*/}
      <TodoFormItemTimeSchedule
        todoItems={todoItems}
        setTodoItems={setTodoItems}
        validationTxtRef={validationTxtRef}
      />

      {/* 登録ボタン */}
      <div className="mt-4">
        <TodoFormItemRegiBtn
          todoItems={todoItems}
          resetStates={resetStates}
          validationTxt={validationTxt}
          validationTxtRef={validationTxtRef}
          onClose={onClose}
        />
      </div>
    </form>
  );
}

export default memo(TodoForm);
