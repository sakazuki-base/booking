import { atom } from "jotai";
import type { todoItemType } from "../components/schedule/todoItems/ts/todoItemType";
import { atomWithDefault } from "jotai/utils";

/**
 *【atomWithDefault】は非同期の初期値を扱える jotai のユーティリティ
 * 引数として渡した非同期関数（この場合はfetchを行う関数）が実行され、その結果が atom の初期値として設定される
 * コンポーネント内で useAtom(fetchTodoMemoAtom) を使用すると、自動的に：
    1. フェッチ処理が実行される
    2. データが取得できるまでの間は undefined または Promise の状態になる
    3. データ取得完了後、取得したデータで状態が更新される
*/

export const fetchTodoMemoAtom = atomWithDefault(async () => {
    // API_URL： 500 error 対策で環境変数を使用
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // GET処理： src/app/api/reservations/route.ts の GET によりDBからのデータを取得 
    const response: Response = await fetch(`${API_URL}api/reservations`, { cache: 'no-store' });
    const resObj: todoItemType[] = await response.json();
    return resObj;
});

export const todoMemoAtom = atom<todoItemType[]>([]);
export const isDesktopViewAtom = atom<boolean>(false);