import { ChangeEvent, Dispatch, memo, SetStateAction } from "react";
import { todoItemType } from "../ts/todoItemType";
import { useHandleFormEntries } from "@/hooks/useHandleFormEntries";

function TodoFormItemPassword({ todoItems, setTodoItems }: {
    todoItems: todoItemType,
    setTodoItems: Dispatch<SetStateAction<todoItemType>>
}) {
    const { handleFormEntries } = useHandleFormEntries();

    return (
        <label><span>パスワード</span><input type="text" value={todoItems.pw} id="pw" onInput={(e: ChangeEvent<HTMLInputElement>) => handleFormEntries<todoItemType>(e, todoItems, setTodoItems)} />
        </label>
    )
}

export default memo(TodoFormItemPassword);