import { memo } from "react";
import roomStyle from "../styles/roomstyle.module.css";
import ViewCurrentTimeTableDay from "./ViewCurrentTimeTableDay";

type ctrlBtnsProps = {
    ctrlMultiTimeTable: number;
    setCtrlMultiTimeTable: React.Dispatch<React.SetStateAction<number>>;
    today: number;
};

function MultiTimeTableCtrlBtns({ props }: { props: ctrlBtnsProps }) {
    const { ctrlMultiTimeTable, setCtrlMultiTimeTable, today } = props;

    // 当年当月の「0日目」を取得（翌月の0日＝当月の最終日）し、その日付（最終日）を出す
    // 例：const thisLastDay = new Date(2025, 6, 0).getDate()
    const thisLastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

    // 最終週かどうか判定
    const isLastWeek: boolean = today > (thisLastDay - 7);

    // 翌日のタイムテーブルを制御する関数
    const ctrlNextTimeTable: (day: number) => void = (day: number) => {
        // 最終日の場合は来月初日をセットする
        if (day === thisLastDay) {
            setCtrlMultiTimeTable(1);
            return;
        }

        // 当日より起算して7日を超える場合は何もしない（タイムテーブルの表示は翌週までに制限）
        const oneWeekLater: number = today + 7;
        const isPassedThisMonth: boolean = day <= 7 && day >= oneWeekLater - thisLastDay;
        if (day >= oneWeekLater || (isLastWeek && isPassedThisMonth)) {
            return;
        }

        setCtrlMultiTimeTable(prev => prev + 1);
    }

    // 前日のタイムテーブルを制御する関数
    const ctrlPrevTimeTable: (day: number) => void = (day: number) => {
        if (day === today) {
            return;
        }

        if (day === 1) {
            setCtrlMultiTimeTable(thisLastDay);
            return;
        }

        setCtrlMultiTimeTable(prev => prev - 1);
    }

    // ボタンのクリックイベントハンドラ（タイムテーブルの制御を担う）
    const handleCtrlMultiTimeTable: (e: React.MouseEvent<HTMLButtonElement>) => void = (e: React.MouseEvent<HTMLButtonElement>) => {
        const btnDataAttr: string = e.currentTarget.getAttribute('data-btn') ?? '';
        if (btnDataAttr === 'prev') {
            ctrlPrevTimeTable(ctrlMultiTimeTable);
        } else if (btnDataAttr === 'next') {
            ctrlNextTimeTable(ctrlMultiTimeTable);
        }
    };

    return (
        <>
            <div className={roomStyle.multiTimeTableCtrlBtns}>
                <button onClick={handleCtrlMultiTimeTable} data-btn="prev">&lt; 前日</button>
                <button onClick={handleCtrlMultiTimeTable} data-btn="next">翌日 &gt;</button>
            </div>
            <ViewCurrentTimeTableDay ctrlMultiTimeTable={ctrlMultiTimeTable} isLastWeek={isLastWeek} />
        </>
    );
}

export default memo(MultiTimeTableCtrlBtns);