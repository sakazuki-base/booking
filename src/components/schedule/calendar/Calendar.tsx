"use client"

import { memo, useEffect, useState } from "react";
import calendarStyle from "./styles/calendarStyle.module.css";
import type { calendarItemType } from "./ts/calendarItemType";
import { useAtom } from "jotai";
import { fetchTodoMemoAtom, isDesktopViewAtom } from "@/types/calendar-atom";
import PrevNextMonthBtns from "./components/PrevNextMonthBtns";
import DaydateList from "./components/DaydateList";
import DaysList from "./components/DaysList";
import { useGetMonthDays } from "./hooks/useGetMonthDays";
import { useRemovePastSchedule } from "./hooks/useRemovePastSchedule";

function Calendar() {
    const [, setDesktopView] = useAtom(isDesktopViewAtom);
    const [fetchTodoMemo] = useAtom(fetchTodoMemoAtom);

    const currYear = new Date().getFullYear();
    const currMonth = new Date().getMonth() + 1;
    const [ctrlYear, setCtrlYear] = useState<number>(currYear);
    const [ctrlMonth, setCtrlMonth] = useState<number>(currMonth);
    const [days, setDays] = useState<calendarItemType[]>([]);

    const { getMonthDays } = useGetMonthDays();
    const { removePastSchedule } = useRemovePastSchedule();

    const handleCheckIsDesktopView: () => void = () => {
        if (isMounted && window.matchMedia("(min-width: 1025px)").matches) {
            setDesktopView(true);
        }
    }

    const jumpThisMonth: () => void = () => {
        const thisYear: number = new Date().getFullYear();
        const thisMonth: number = new Date().getMonth() + 1;
        setCtrlYear(thisYear);
        setCtrlMonth(thisMonth);
        getMonthDays(thisYear, thisMonth, setDays);
        window.scrollTo(0, 0);
    }

    // 418ハイドレーションエラー対策（用のクライアントサイドでの処理を確実に保証するState）
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) {
            return;
        }
        handleCheckIsDesktopView();
        removePastSchedule(isMounted, fetchTodoMemo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted, fetchTodoMemo]);

    useEffect(() => {
        getMonthDays(ctrlYear, ctrlMonth, setDays);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctrlMonth]);

    return (
        <section className={calendarStyle.wrapper}>
            <h2>{ctrlYear}年{ctrlMonth}月</h2>
            <PrevNextMonthBtns props={{
                className: calendarStyle.btns!, // undefinedにならないことを明示
                ctrlYear: ctrlYear,
                setCtrlYear: setCtrlYear,
                ctrlMonth: ctrlMonth,
                setCtrlMonth: setCtrlMonth
            }} />
            <button id={calendarStyle["jumpThisMonth"]} type="button" onClick={jumpThisMonth}>今月に移動</button>
            <ul className={calendarStyle.calendar}>
                <DaydateList days={days} />
                <DaysList days={days} />
            </ul>
        </section>
    );
}

export default memo(Calendar);