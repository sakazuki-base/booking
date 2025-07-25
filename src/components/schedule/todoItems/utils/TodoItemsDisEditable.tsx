import { ChangeEvent, memo, useState } from "react";
import todoStyle from "../styles/todoStyle.module.css";
import { todoItemType } from "../ts/todoItemType";
import { useHandleInputValueSanitize } from "@/hooks/useHandleInputValueSanitize";
import { useCreateTimeSpace } from "@/hooks/useCreateTimeSpace";

type TodoItemsEditableTypes = {
    todoItem: todoItemType;
    updateTodoMemoEditState: (editState: boolean) => void;
};

function TodoItemsEditable({ props }: { props: TodoItemsEditableTypes }) {
    const { todoItem, updateTodoMemoEditState } = props;

    const { handleInputValueSanitize } = useHandleInputValueSanitize();
    const { adjustViewerTimeSpace } = useCreateTimeSpace();

    const [checkPassword, setCheckPassword] = useState<string>('');
    const handleCheckPassword: (e: ChangeEvent<HTMLInputElement>) => void = (e: ChangeEvent<HTMLInputElement>) => {
        // サニタイズした値をセッター関数（ setCheckPassword ）にセット
        const checkPasswordStr: string = handleInputValueSanitize(e.currentTarget.value);
        setCheckPassword(checkPasswordStr);

        if (checkPasswordStr === todoItem.pw) {
            alert('パスワードが解除されました');
            updateTodoMemoEditState(true); // todoItem.edit を true に
            setCheckPassword('');
        }
    }

    return (
        <div className={todoStyle.editFalseMode}>
            <div className={todoStyle.editTargetContent}>
                <p>◯ 現在の予約内容 ---</p>
                <p>予約内容：{todoItem.todoContent}</p>
                {todoItem.person && <p>予約者／部署名：{todoItem.person}</p>}
                {todoItem.rooms && <p>場所：{todoItem.rooms}</p>}
                {todoItem.startTime && <p>開始時刻：{todoItem.startTime}</p>}
                {todoItem.finishTime && <p>終了時刻：{adjustViewerTimeSpace(todoItem.finishTime)}</p>}
            </div>
            <label className={todoStyle.pwLabel}><span>パスワード</span><input type="text" value={checkPassword} onInput={handleCheckPassword} />
            </label>
        </div>
    );
}

export default memo(TodoItemsEditable);