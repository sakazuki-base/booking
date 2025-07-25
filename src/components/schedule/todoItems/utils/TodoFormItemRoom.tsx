import { ChangeEvent, Dispatch, Ref, memo, SetStateAction, RefObject } from "react";
import { todoItemType } from "../ts/todoItemType";
import { roomsType } from "@/components/rooms/ts/roomsType";
import { useHandleFormEntries } from "@/hooks/useHandleFormEntries";
import { useCheckTimeValidation } from "../hooks/useCheckTimeValidation";

function TodoFormItemRoom({ rooms, todoItems, setTodoItems, roomRef, validationTxtRef }: {
    rooms: roomsType,
    todoItems: todoItemType,
    setTodoItems: Dispatch<SetStateAction<todoItemType>>,
    roomRef: Ref<HTMLSelectElement> | undefined,
    validationTxtRef?: RefObject<string>
}) {
    const { handleFormEntries } = useHandleFormEntries();

    const { checkTimeValidation } = useCheckTimeValidation();
    checkTimeValidation(todoItems, validationTxtRef);

    return (
        <>
            {rooms.length > 0 &&
                <>
                    <label><span>場所</span></label>
                    <select name="rooms" id="rooms" ref={roomRef} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleFormEntries<todoItemType>(e, todoItems, setTodoItems)}>
                        {rooms.map((room, i) => (
                            <option key={i} value={room.room}>{room.room}</option>
                        ))}
                    </select>
                </>
            }
        </>
    )
}

export default memo(TodoFormItemRoom);