import { ChangeEvent, Dispatch, memo, SetStateAction } from "react";
import { todoItemType } from "../ts/todoItemType";
import { useHandleFormEntries } from "@/hooks/useHandleFormEntries";

function TodoFormItemPerson({ todoItems, setTodoItems }: {
    todoItems: todoItemType,
    setTodoItems: Dispatch<SetStateAction<todoItemType>>
}) {
    const { handleFormEntries } = useHandleFormEntries();

    return (
        <label><span>予約者／部署名</span><input type="text" value={todoItems.person} id="person" onInput={(e: ChangeEvent<HTMLInputElement>) => handleFormEntries<todoItemType>(e, todoItems, setTodoItems)} />
        </label>
    )
}

export default memo(TodoFormItemPerson);