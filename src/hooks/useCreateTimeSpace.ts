export const useCreateTimeSpace = () => {
    // タイムテーブルへの描画用処理（適用先： useRegiTodoItem.ts, useUpdateTodoItem.ts）
    const createTimeSpace: (finishTime: string | undefined) => string = (finishTime: string | undefined) => {
        if (typeof finishTime === 'undefined') {
            return ''; // 空文字を返して処理終了
        }

        // 予約終了時間に+15分の余剰時間を設ける（予約間隔にゆとりを持たせるため）
        //const finishHour: number = parseInt(finishTime.split(':')[0]);
        //const finishMinute: number = parseInt(finishTime.split(':')[1]) + 15; // 15分加算
        const [hourStr, minuteStr] = finishTime.split(':');
        if (!hourStr || !minuteStr) return '';
        const finishHour = parseInt(hourStr, 10);
        const finishMinute = parseInt(minuteStr, 10) + 15;

        // 時刻をまたぐ（終了時間が45分以降の）場合は時間として成立するように数値調整
        const theFinishHour: number = finishMinute > 45 ? finishHour + 1 : finishHour;
        const theFinishMinute: number = finishMinute > 45 ? finishMinute - 60 : finishMinute;

        // 調整済み時間（hh:mm）
        const adjustFinishTime: string = `${theFinishHour.toString().padStart(2, '0')}:${theFinishMinute.toString().padStart(2, '0')}`;

        return adjustFinishTime;
    }


    // カレンダーリストへの描画用処理（適用先： TodoList.tsx, TodoItemsEditable.tsx.tsx, TodoItemsDisEditable.tsx）
    const adjustViewerTimeSpace: (finishTime: string) => string = (finishTime: string) => {
        // 時刻は入力内容を表示するため createTimeSpace と真逆の処理を行う
        // const finishHour: number = parseInt(finishTime.split(':')[0]);
        // const finishMinute: number = parseInt(finishTime.split(':')[1]) - 15; // 15分減算
        const [hourStr, minuteStr] = finishTime.split(':');
        if (!hourStr || !minuteStr) return '';
        const finishHour = parseInt(hourStr, 10);
        const finishMinute = parseInt(minuteStr, 10) - 15;

        // 数値調整
        const theFinishHour: number = finishMinute < 0 ? finishHour - 1 : finishHour;
        //const theFinishMinute: number = finishMinute < 0 ? 60 - parseInt(finishMinute.toString().split('-')[1]) : finishMinute;
        const theFinishMinute = finishMinute < 0 ? 60 - Math.abs(finishMinute) : finishMinute;

        // ここは createTimeSpace と同じ
        const adjustFinishTime: string = `${theFinishHour.toString().padStart(2, '0')}:${theFinishMinute.toString().padStart(2, '0')}`;

        return adjustFinishTime;
    }

    return { createTimeSpace, adjustViewerTimeSpace }
}