import { memo, useMemo } from "react";
import calendarStyle from "../styles/calendarStyle.module.css";
import todoStyle from "../../todoItems/styles/todoStyle.module.css";
import type { calendarItemType } from "../ts/calendarItemType";
import TodoCtrlClosedBtn from "../../todoItems/TodoCtrlClosedBtn";
import TodoCtrlOpenBtn from "../../todoItems/TodoCtrlOpenBtn";
import TodoForm from "../../todoItems/TodoForm";
import TodoList from "../../todoItems/TodoList";

type todaySignal = {
    thisYear: number;
    thisMonth: number;
    today: number;
};

function DaysList({ days }: { days: calendarItemType[] }) {
    const isNotPastDays: (day: calendarItemType) => boolean = (day: calendarItemType) => {
        const dayDate_adjustDigitMonth: string | number = day.month.toString().length === 1 ? `0${day.month}` : day.month;
        const dayDate_adjustDigitDay: string | number = String(day.day).length === 1 ? `0${day.day}` : day.day;
        const dayDate: number = parseInt(`${day.year}${dayDate_adjustDigitMonth}${dayDate_adjustDigitDay}`);

        const theDate: Date = new Date();
        const theDate_adjustDigitMonth: string | number = String(theDate.getMonth() + 1).length === 1 ? `0${theDate.getMonth() + 1}` : theDate.getMonth() + 1;
        const theDate_adjustDigitDay: string | number = String(theDate.getDate()).length === 1 ? `0${theDate.getDate()}` : theDate.getDate();
        const date: number = parseInt(`${theDate.getFullYear()}${theDate_adjustDigitMonth}${theDate_adjustDigitDay}`);

        return dayDate >= date;
    }

    const today: todaySignal = useMemo(() => {
        return {
            thisYear: new Date().getFullYear(),
            thisMonth: new Date().getMonth() + 1,
            today: new Date().getDate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {days.map(day => (
                // カスタムデータ属性の指定は low-case でないと React から怒られる
                <li key={`${day.year}/${day.month}/${day.day}`} data-daydate={day.dayDateNum} className={
                    (
                        today.thisYear === day.year &&
                        today.thisMonth === day.month &&
                        today.today === day.day
                    ) ?
                        `${calendarStyle.todaySignal} ${calendarStyle.calendarLists}` :
                        `${calendarStyle.calendarLists}`
                }>
                    <p>
                        {day.signalPrevNextMonth && <span>{day.month}/</span>}{day.day}
                    </p>
                    {day.signalPrevNextMonth ? null :
                        <>
                            {isNotPastDays(day) &&
                                <div className={`${todoStyle.todoView}`}>
                                    <TodoCtrlOpenBtn day={day} />
                                    <div className={`${todoStyle.todoCtrlElm}`}>
                                        <TodoCtrlClosedBtn />
                                        <p className={todoStyle.today}>{day.month}/{day.day}（{day.dayDate}）</p>
                                        <TodoForm props={{
                                            todoId: `${day.year}/${day.month}/${day.day}`
                                        }} />
                                    </div>
                                    <TodoList todoID={`${day.year}/${day.month}/${day.day}`} />
                                </div>
                            }
                        </>
                    }
                </li>
            ))}
        </>
    );
}

export default memo(DaysList);