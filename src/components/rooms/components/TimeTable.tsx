import roomStyle from "../styles/roomstyle.module.css";
import { memo } from "react";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";
import TimeBlock from "./TimeBlock";
import { todoItemType } from "../../schedule/todoItems/ts/todoItemType";

type timeTableProps = {
    room: string;
    todoMemo: todoItemType[];
    ctrlMultiTimeTable: number;
};

function TimeTable({ props }: { props: timeTableProps }) {
    const { room, todoMemo, ctrlMultiTimeTable } = props;

    const timeBlocks: number[] = [];
    for (let i = timeBlockBegin; i < timeBlockEnd; i++) timeBlocks.push(i);

    return (
        <ul>
            {timeBlocks.map(timeBlock => (
                <li key={timeBlock}>
                    <span>{timeBlock}</span>
                    <div className={roomStyle.minBlocks}>
                        <TimeBlock props={{
                            room: room,
                            timeBlock: timeBlock,
                            todoMemo: todoMemo,
                            ctrlMultiTimeTable: ctrlMultiTimeTable
                        }} />
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default memo(TimeTable);