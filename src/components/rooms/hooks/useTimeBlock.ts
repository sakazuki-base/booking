import { useMemo } from "react";
import { todoItemType } from "@/components/schedule/todoItems/ts/todoItemType";
import { reservedInfoType } from "../ts/roomsType";
import { useCreateTimeSpace } from "@/hooks/useCreateTimeSpace";

export const useTimeBlock = () => {
    const { adjustViewerTimeSpace } = useCreateTimeSpace();

    // memo.todoID との比較用データ生成処理（当日より1週間分の各部屋ごとのタイムテーブル配列{relevantReservations}を用意するため）
    const useCreateTimeTableViewDay: (ctrlMultiTimeTable: number) => string = (ctrlMultiTimeTable: number) => {
        const thisYear: number = new Date().getFullYear();
        const thisMonth: number = new Date().getMonth() + 1;

        // 当年当月の「0日目」を取得（翌月の0日＝当月の最終日）し、その日付（最終日）を出す
        const thisLastDay = new Date(thisYear, thisMonth, 0).getDate();

        // 最終週かどうか判定
        const isLastWeek: boolean = new Date().getDate() > (thisLastDay - 7);

        const theTimeTableViewDay: string = useMemo(() => {
            return `${thisYear}/${isLastWeek && ctrlMultiTimeTable < 7 ? thisMonth + 1 : thisMonth}/${ctrlMultiTimeTable}`;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [ctrlMultiTimeTable]);

        return theTimeTableViewDay;
    }

    // 予約状態（isReserved）の確認及び予約内容情報の取得を行う
    const getReservedInfo: (relevantReservations: todoItemType[], timeBlock: number, minBlock: number) => reservedInfoType = (
        relevantReservations: todoItemType[],
        timeBlock: number,
        minBlock: number
    ) => {
        let reservedInfo: reservedInfoType = {
            isReserved: false,
            content: ""
        }

        for (const todoItem of [...relevantReservations]) {
            const theTime = parseInt(`${timeBlock}${minBlock.toString().padStart(2, '0')}`);
            const start = parseInt(todoItem.startTime?.split(':').join('') ?? '0');
            const finish = parseInt(todoItem.finishTime?.split(':').join('') ?? '0');

            if (theTime >= start && theTime <= finish) {
                reservedInfo = {
                    isReserved: theTime >= start && theTime <= finish,
                    content: todoItem.todoContent,
                    room: todoItem.rooms,
                    person: todoItem.person,
                    startTime: todoItem.startTime,
                    // 終了時間はバッファ時間（15分）を減算
                    finishTime: todoItem.finishTime && adjustViewerTimeSpace(todoItem.finishTime)
                }
            }
        }

        return reservedInfo;
    };

    // 終了時間のラスト15分を判定
    const checkLast15: (relevantReservations: todoItemType[], timeBlock: number, minBlock: number) => boolean = (
        relevantReservations: todoItemType[],
        timeBlock: number,
        minBlock: number
    ) => {
        // 現在チェック対象の時刻を分単位に変換
        const targetTimeInMinutes = timeBlock * 60 + minBlock;

        // 関連する予約をチェック
        const bufferCheck: boolean[] = [...relevantReservations]
            .filter(todoItem => typeof todoItem.finishTime !== 'undefined')
            .map(todoItem => {
                //（!）非nullアサーション演算子：nullでないことをTypeScriptに伝える
                // splitした文字列（配列要素）を個別の変数に分割代入し、それらを数値型変換して取り扱いやすくする
                const [finishHourStr, finishMinuteStr] = todoItem.finishTime!.split(':');
                const finishHour = parseInt(finishHourStr);
                const finishMinute = parseInt(finishMinuteStr);

                // 終了時刻を分単位に変換（冒頭の targetTimeInMinutes と比較する際の整合性を取るため）
                const finishTimeInMinutes = finishHour * 60 + finishMinute;

                // 15分前の時刻を分単位で計算
                const bufferStartInMinutes = finishTimeInMinutes - 15;

                // ターゲット時刻が15分バッファ内にあるかチェック
                const isInBuffer: boolean = targetTimeInMinutes >= bufferStartInMinutes && targetTimeInMinutes < finishTimeInMinutes;

                return isInBuffer;
            });

        // 一つでも trueがあれば trueを返し、それ以外は falseを返す
        const hasConflict: boolean = bufferCheck.some(buffer => buffer === true);

        return hasConflict;
    };

    return { useCreateTimeTableViewDay, getReservedInfo, checkLast15 }
}