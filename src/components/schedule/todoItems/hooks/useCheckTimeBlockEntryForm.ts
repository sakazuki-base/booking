import { ChangeEvent } from "react";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";
import { todoItemType } from "../ts/todoItemType";
import { useAtom } from "jotai";
import { todoMemoAtom } from "@/types/calendar-atom";

export const useCheckTimeBlockEntryForm = () => {
    const [todoMemo] = useAtom(todoMemoAtom);

    /* `src/app/types/rooms-atom.ts`で指定した予約受付可能な時間帯かチェック */
    const checkTimeBlockEntryForm: (e: ChangeEvent<HTMLInputElement> | string) => boolean = (
        e: ChangeEvent<HTMLInputElement> | string
    ) => {
        const valueStr: string = typeof e !== 'string' ? e.target.value : e;
        const isNoReservationTime: boolean = parseInt(valueStr) < timeBlockBegin || parseInt(valueStr) >= timeBlockEnd;

        return isNoReservationTime;
    }

    /* 同部屋内・同日での予約時間の重複確認（開始と終了「それぞれ」の予定重複状況をタイムリーにチェック）*/
    const checkTimeSchedule: (targetTime: ChangeEvent<HTMLInputElement> | string, todoItems: todoItemType) => boolean = (
        targetTime: ChangeEvent<HTMLInputElement> | string,
        todoItems: todoItemType
    ) => {
        const theTime: number = typeof targetTime !== 'string' ?
            parseInt(targetTime.target.value.replace(':', '')) :
            parseInt(targetTime.replace(':', ''));

        const isCheckTimeSchedule: boolean = todoMemo.some(memo => {
            const isMatchDay: boolean = memo.todoID === todoItems.todoID;

            if (
                typeof memo.rooms !== 'undefined' &&
                typeof memo.startTime !== 'undefined' &&
                typeof memo.finishTime !== 'undefined'
            ) {
                const isMatchRoom: boolean = typeof todoItems.rooms !== 'undefined' ? memo.rooms === todoItems.rooms : false;

                // 自身が登録した予約時間は検証対象外（編集時の回避措置）
                const isSelf: boolean = todoItems.id === memo.id;
                if (isSelf) {
                    return false;
                }

                const memoStartTime = parseInt(memo.startTime.replace(':', ''));
                const memoFinishTime = parseInt(memo.finishTime.replace(':', ''));

                // 検証対象の時間を設定
                const theStartTime = typeof todoItems.startTime !== 'undefined' ? parseInt(todoItems.startTime.replace(':', '')) : theTime;
                const theFinishTime = typeof todoItems.finishTime !== 'undefined' ? parseInt(todoItems.finishTime.replace(':', '')) : theTime;

                // 00分スタートと、それ以外の場合で差計算用の数値を調整（hh:00 -> -hh:46, hh:45 -> hh:31）
                const calcBufferingStartTime = memoStartTime.toString().slice(2, 4) === '00' ? 54 : 14;

                // console.log("既存予約:", memoStartTime, memoFinishTime);
                // console.log("チェック対象:", theStartTime, theFinishTime);

                // 時間の重複チェックロジック
                const isOverlap: boolean =
                    // 新しい予約の開始時間が既存の予約時間内にある
                    (theStartTime >= memoStartTime && theStartTime <= memoFinishTime) ||
                    // 新しい予約の終了時間が既存の（15分余剰を含んだ）予約時間内にある
                    (theFinishTime >= memoStartTime - calcBufferingStartTime && theFinishTime <= memoFinishTime) ||
                    // 新しい予約が既存の予約を完全に包含している
                    (theStartTime <= memoStartTime && theFinishTime >= memoFinishTime);

                // 当日限定かつ 予約室が合致かつ 時間が被っている場合
                return isMatchDay && isMatchRoom && isOverlap;
            }

            return false;
        });

        return isCheckTimeSchedule;
    }

    return { checkTimeBlockEntryForm, checkTimeSchedule }
}