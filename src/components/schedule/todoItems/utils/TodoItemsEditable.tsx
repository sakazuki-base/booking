import { memo, SyntheticEvent } from "react";
import todoStyle from "../styles/todoStyle.module.css";
import { todoItemType } from "../ts/todoItemType";
import TodoForm from "../TodoForm";
import { useDeleteTodoItem } from "../hooks/useDeleteTodoItem";
import { useCreateTimeSpace } from "@/hooks/useCreateTimeSpace";

type TodoItemsEditableTypes = {
    todoItem: todoItemType;
    updateTodoMemoEditState: (editState: boolean) => void;
    handleCloseModalWindowBtnClicked: (btnEl: SyntheticEvent<HTMLButtonElement>) => void;
};

function TodoItemsEditable({ props }: { props: TodoItemsEditableTypes }) {
    const { todoItem, updateTodoMemoEditState, handleCloseModalWindowBtnClicked } = props;

    const { deleteTodoItem } = useDeleteTodoItem();
    const { adjustViewerTimeSpace } = useCreateTimeSpace();

    const changeMode: (todoItem: todoItemType) => void = (todoItem: todoItemType) => {
        let editState: boolean | null = null; // todoItem.edit

        if (todoItem.edit === false) {
            editState = true;
        } else {
            editState = false;
        }

        updateTodoMemoEditState(editState);
    }

    return (
        <>
            <div className={todoStyle.editTargetContent}>
                <p>◯ 編集前 ---</p>
                <p>予約内容：{todoItem.todoContent}</p>
                {todoItem.person && <p>予約者／部署名：{todoItem.person}</p>}
                {todoItem.rooms && <p>場所：{todoItem.rooms}</p>}
                {todoItem.startTime && <p>開始時刻：{todoItem.startTime}</p>}
                {todoItem.finishTime && <p>終了時刻：{adjustViewerTimeSpace(todoItem.finishTime)}</p>}
                {todoItem.pw && <p>登録パスワード：{todoItem.pw}</p>}
            </div>
            <TodoForm props={{
                todoItem: todoItem
            }} />
            <div className={todoStyle.editerIntoCtrlBtns}>
                <button id={todoStyle["deleteBtn"]} className={todoStyle.formBtns} type="button" onClick={(deleteBtn: SyntheticEvent<HTMLButtonElement>) => {
                    handleCloseModalWindowBtnClicked(deleteBtn);
                    deleteTodoItem(todoItem.id);
                }}>削除</button>
                <button className={`${todoStyle.formBtns} ${todoStyle.editBtn}`} type="button" onClick={() => {
                    changeMode(todoItem);
                }}>戻る</button>
            </div>
        </>
    );
}

export default memo(TodoItemsEditable);