"use client";

import type {
  ChangeEvent,
  Dispatch,
  Ref,
  SetStateAction,
  RefObject,
} from "react";
import { memo } from "react";
import type { todoItemType } from "../ts/todoItemType";
import type { roomsType } from "@/components/schedule/todoItems/ts/roomsType.ts";
import { useHandleFormEntries } from "@/hooks/useHandleFormEntries";
import { useCheckTimeValidation } from "../hooks/useCheckTimeValidation";

function TodoFormItemRoom({
  rooms,
  todoItems,
  setTodoItems,
  roomRef,
  validationTxtRef,
  isSelectable = false,
}: {
  rooms: roomsType;
  todoItems: todoItemType;
  setTodoItems: Dispatch<SetStateAction<todoItemType>>;
  roomRef: Ref<HTMLSelectElement> | undefined;
  validationTxtRef?: RefObject<string>;
  isSelectable?: boolean;
}) {
  const { handleFormEntries } = useHandleFormEntries();

  const { checkTimeValidation } = useCheckTimeValidation();
  checkTimeValidation(todoItems, validationTxtRef);

  return (
    <>
      {rooms.length > 0 && (
        <>
          <label>
            <span>場所</span>
          </label>
          {isSelectable ? (
            <select
              name="rooms"
              id="rooms"
              ref={roomRef}
              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                handleFormEntries<todoItemType>(e, todoItems, setTodoItems)
              }
            >
              {rooms.map((room, i) => (
                <option key={i} value={room.room}>
                  {room.room}
                </option>
              ))}
            </select>
          ) : (
            <span>: {todoItems.rooms}</span>
          )}
        </>
      )}
    </>
  );
}

export default memo(TodoFormItemRoom);
