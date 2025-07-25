import { memo, useMemo } from "react";
import { todoItemType } from "../../schedule/todoItems/ts/todoItemType";
import { reservedInfoType } from "../ts/roomsType";
import { useTimeBlock } from "../hooks/useTimeBlock";
import { useCtrlToolTips } from "../hooks/useCtrlToolTips";

type TimeBlockType = {
    room: string;
    timeBlock: number;
    todoMemo: todoItemType[];
    ctrlMultiTimeTable: number;
};

function TimeBlock({ props }: { props: TimeBlockType }) {
    const { room, timeBlock, todoMemo, ctrlMultiTimeTable } = props;

    const minBlocks: number[] = [];
    for (let i = 1; i <= 59; i++) minBlocks.push(i);

    const { useCreateTimeTableViewDay, getReservedInfo, checkLast15 } = useTimeBlock();

    const { hoverEventListener, leaveEventListener } = useCtrlToolTips();

    const theTimeTableViewDay: string = useCreateTimeTableViewDay(ctrlMultiTimeTable);

    // useMemo を使用した動的な予約情報（当日より1週間分の各部屋ごとのタイムテーブル配列）の取得 
    const relevantReservations: todoItemType[] = useMemo(() => {
        return [...todoMemo].filter(memo =>
            (memo.todoID === theTimeTableViewDay) &&
            (typeof memo.rooms !== 'undefined' && memo.rooms === room)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [todoMemo, room, ctrlMultiTimeTable]);

    return (
        <>
            {minBlocks.map(minBlock => {
                const reservedInfo: reservedInfoType = getReservedInfo(relevantReservations, timeBlock, minBlock);
                const isLast15: boolean = checkLast15(relevantReservations, timeBlock, minBlock);

                return (
                    <div
                        key={minBlock}
                        data-minblock={minBlock}
                        data-reserved={reservedInfo.isReserved}
                        data-last15={reservedInfo.isReserved && isLast15}
                        data-info={`${reservedInfo.content.length > 16 ?
                            `${reservedInfo.content.slice(0, 16)}...` : reservedInfo.content}
                            ${reservedInfo.room && `／${reservedInfo.room?.split('：')[1]}`}
                            ${reservedInfo.startTime && `／${reservedInfo.startTime}～${reservedInfo.finishTime}`}
                            ${reservedInfo.person && `／${reservedInfo.person}`}
                            `}
                        onMouseOver={reservedInfo.content.length > 0 ? hoverEventListener : undefined}
                        onTouchStart={reservedInfo.content.length > 0 ? hoverEventListener : undefined}
                        onMouseLeave={leaveEventListener}
                        onTouchEnd={leaveEventListener}
                    >&nbsp;</div>
                )
            })}
        </>
    );
}

export default memo(TimeBlock);