import { ChangeEvent, memo, useRef, useState } from "react";
import todoStyle from "./styles/todoStyle.module.css";
import { useAtom } from "jotai";
import { roomsAtom } from "@/types/rooms-atom";
import { todoItemType } from "./ts/todoItemType";
import TodoFormItemContent from "./utils/TodoFormItemContent";
import TodoFormItemPerson from "./utils/TodoFormItemPerson";
import TodoFormItemRoom from "./utils/TodoFormItemRoom";
import TodoFormItemTimeSchedule from "./utils/TodoFormItemTimeSchedule";
import TodoFormItemPassword from "./utils/TodoFormItemPassword";
import TodoFormItemRegiBtn from "./utils/TodoFormItemRegiBtn";
import { useRegiTodoItem } from "./hooks/useRegiTodoItem";
import { useUpdateTodoItem } from "./hooks/useUpdateTodoItem";
import { useScrollTop } from "@/hooks/useScrollTop";
import { useHandleFormItems } from "./hooks/useHandleFormItems";

type TodoFormType = {
    todoItem?: todoItemType;
    todoId?: string;
};

function TodoForm({ props }: { props: TodoFormType }) {
    const { todoItem, todoId } = props;

    const [rooms] = useAtom(roomsAtom);

    const roomRef = useRef<null | HTMLSelectElement>(null);
    const validationTxtRef = useRef<string>('');

    const initTodoItems: todoItemType = {
        id: todoItem ? todoItem.id : '001',
        todoID: todoId ? todoId : todoItem ? todoItem.todoID : '001',
        todoContent: '',
        edit: todoItem ? todoItem.edit : false,
        pw: '',
        person: todoItem ? todoItem.person : '',
        rooms: roomRef.current !== null ? roomRef.current.value : rooms[0].room,
        startTime: '',
        finishTime: ''
    }
    const [todoItems, setTodoItems] = useState<todoItemType>(initTodoItems);

    const { regiTodoItem } = useRegiTodoItem();
    const { updateTodoItem } = useUpdateTodoItem();
    const { scrollTop } = useScrollTop();
    const { handleOpenClosedBtnClicked } = useHandleFormItems();

    const resetStates: () => void = () => {
        setTodoItems(initTodoItems);
        setTimeout(() => scrollTop()); // button のクリックイベントでスクロールトップしないので回避策として疑似的な遅延処理
    }

    return (
        <form className={todoStyle.todoForm} onSubmit={(formElm: ChangeEvent<HTMLFormElement>) => {
            formElm.preventDefault();
            if (!todoItems.edit) {
                regiTodoItem(todoItems);
                handleOpenClosedBtnClicked(formElm);
            } else {
                updateTodoItem(todoItems);
            }
            resetStates();
        }}>
            {/* 予約内容 */}
            <TodoFormItemContent todoItems={todoItems} setTodoItems={setTodoItems} />

            {/* 予約者／部署名 */}
            <TodoFormItemPerson todoItems={todoItems} setTodoItems={setTodoItems} />

            {/* 予約室 */}
            <TodoFormItemRoom rooms={rooms} todoItems={todoItems} setTodoItems={setTodoItems} roomRef={roomRef} validationTxtRef={validationTxtRef} />

            {/* タイムテーブル（スケジュール）*/}
            <TodoFormItemTimeSchedule todoItems={todoItems} setTodoItems={setTodoItems} validationTxtRef={validationTxtRef} />

            {/* パスワード */}
            <TodoFormItemPassword todoItems={todoItems} setTodoItems={setTodoItems} />

            {/* 登録ボタン */}
            <TodoFormItemRegiBtn todoItems={todoItems} resetStates={resetStates} validationTxtRef={validationTxtRef} />
        </form>
    );
}

export default memo(TodoForm);