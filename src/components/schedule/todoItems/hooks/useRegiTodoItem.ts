import { v4 as uuidv4 } from 'uuid'; // key へ渡すための固有の識別子を生成する npm ライブラリ
import { todoItemType } from "../ts/todoItemType";
import { useAtom } from "jotai";
import { todoMemoAtom } from '@/types/calendar-atom';
import { useCreateTimeSpace } from '@/hooks/useCreateTimeSpace';

export const useRegiTodoItem = () => {
    const [todoMemo, setTodoMemo] = useAtom(todoMemoAtom);

    // 予約終了時間に+15分の余剰時間を設ける
    const { createTimeSpace } = useCreateTimeSpace();

    /* データベース（SQLite）に予約を登録 */
    const createReservation: (data: todoItemType) => Promise<todoItemType> = async (data: todoItemType) => {
        const response = await fetch('/api/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return response.json();
    };

    /* ToDo（予約）の登録 */
    const regiTodoItem: (todoItems: todoItemType) => void = (todoItems: todoItemType) => {
        const shallowCopyTodoItems: todoItemType = { ...todoItems }

        const newTodoList: todoItemType = {
            ...shallowCopyTodoItems,
            id: uuidv4(), // key へ渡すための固有の識別子（uuid：Universally Unique Identifier）を生成
            finishTime: createTimeSpace(shallowCopyTodoItems.finishTime)
        }

        if (shallowCopyTodoItems.todoContent.length > 0) {
            createReservation(newTodoList);
            setTodoMemo([...todoMemo, newTodoList]);
            location.reload(); // 登録直後に当該内容を更新すると 500エラーになるため再読み込みさせて登録完了させておく 
        }
    }

    return { regiTodoItem }
}