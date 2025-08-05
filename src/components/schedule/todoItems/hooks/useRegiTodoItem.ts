import type { todoItemType } from "../ts/todoItemType";
import { v4 as uuidv4 } from "uuid";
import { useAtom, useSetAtom } from "jotai";
import { todoMemoAtom, fetchTodoMemoAtom } from "@/types/calendar-atom";

export const useRegiTodoItem = () => {
  const [todoMemo, setTodoMemo] = useAtom(todoMemoAtom);
  const setFetchTodoMemo = useSetAtom(fetchTodoMemoAtom);

  /* データベースに予約を登録 */
  const createReservation: (
    data: todoItemType,
  ) => Promise<todoItemType> = async (data: todoItemType) => {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error("fetch失敗:", response.status, response.statusText);
        return null;
      }

      const json = await response.json();
      console.log("登録成功:", json);

      // 登録後に予約一覧を再取得して反映
      const latest = await fetch("/api/reservations").then((res) => res.json());
      setFetchTodoMemo(latest);

      return json;
    } catch (error) {
      console.error("fetch例外発生:", error);
      return null;
    }
  };

  /* ToDo（予約）の登録 */
  const regiTodoItem: (todoItems: todoItemType) => void = (
    todoItems: todoItemType,
  ) => {
    const shallowCopyTodoItems: todoItemType = { ...todoItems };

    const newTodoList: todoItemType = {
      ...shallowCopyTodoItems,
      id: uuidv4(), // key へ渡すための固有の識別子（uuid：Universally Unique Identifier）を生成
    };

    createReservation(newTodoList);
    setTodoMemo([...todoMemo, newTodoList]);
    location.reload(); // 登録直後に当該内容を更新すると 500エラーになるため再読み込みさせて登録完了させておく
  };

  return { regiTodoItem };
};
