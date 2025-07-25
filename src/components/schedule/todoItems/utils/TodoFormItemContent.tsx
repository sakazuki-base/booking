import { ChangeEvent, Dispatch, memo, SetStateAction } from "react";
import { todoItemType } from "../ts/todoItemType";
import { useHandleFormEntries } from "@/hooks/useHandleFormEntries";

function TodoFormItemContent({ todoItems, setTodoItems }: {
    todoItems: todoItemType,
    setTodoItems: Dispatch<SetStateAction<todoItemType>>
}) {
    const { handleFormEntries } = useHandleFormEntries();

    return (
        <label><span>予定内容</span><input type="text" value={todoItems.todoContent} id="todoContent" onInput={(e: ChangeEvent<HTMLInputElement>) => handleFormEntries<todoItemType>(e, todoItems, setTodoItems)} />
        </label>
    )
}

export default memo(TodoFormItemContent);