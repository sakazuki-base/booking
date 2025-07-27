"use client";

import { memo, useEffect, useState } from "react";
import type { calendarItemType } from "./ts/calendarItemType";
import { useAtom } from "jotai";
import { fetchTodoMemoAtom, isDesktopViewAtom } from "@/types/calendar-atom";
import PrevNextMonthBtns from "./components/PrevNextMonthBtns";
import DaydateList from "./components/DaydateList";
import DaysList from "./components/DaysList";
import { useGetMonthDays } from "./hooks/useGetMonthDays";
import { useRemovePastSchedule } from "./hooks/useRemovePastSchedule";
import TimeSelector from "./components/TimeSelector";

function Calendar() {
    const [, setDesktopView] = useAtom(isDesktopViewAtom);
    const [fetchTodoMemo] = useAtom(fetchTodoMemoAtom);
    const currYear = new Date().getFullYear();
    const currMonth = new Date().getMonth() + 1;
    const [ctrlYear, setCtrlYear] = useState<number>(currYear);
    const [ctrlMonth, setCtrlMonth] = useState<number>(currMonth);
    const [days, setDays] = useState<calendarItemType[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<number | null>(null);
    const { getMonthDays } = useGetMonthDays();
    const { removePastSchedule } = useRemovePastSchedule();

    const handleCheckIsDesktopView = () => {
        if (isMounted && window.matchMedia("(min-width: 1025px)").matches) {
            setDesktopView(true);
        }
    };

    const jumpThisMonth = () => {
        const thisYear = new Date().getFullYear();
        const thisMonth = new Date().getMonth() + 1;
        setCtrlYear(thisYear);
        setCtrlMonth(thisMonth);
        getMonthDays(thisYear, thisMonth, setDays);
        window.scrollTo(0, 0);
    };

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;
        handleCheckIsDesktopView();
        removePastSchedule(isMounted, fetchTodoMemo);
    }, [isMounted, fetchTodoMemo]);

    useEffect(() => {
        getMonthDays(ctrlYear, ctrlMonth, setDays);
    }, [ctrlMonth]);

    return (
        <section className="max-w-screen-lg w-full mx-auto mb-20">
            <h2 className="text-xl font-bold mb-2">{ctrlYear}年{ctrlMonth}月</h2>

            <PrevNextMonthBtns props={{
                className: "flex justify-between",
                ctrlYear,
                setCtrlYear,
                ctrlMonth,
                setCtrlMonth
            }} />

            <button className="bg-green-700 text-white px-4 py-1 rounded my-4" type="button" onClick={jumpThisMonth}>今月</button>

            {/* 左右分割レイアウト用の全体コンテナ */}
            <div className="flex flex-row gap-8 mt-6 bg-gray-50 p-4">

                {/* カレンダー（日付選択）エリア */}
                <div className="w-full">
                
                    {/* 曜日ヘッダー */}
                    <ul className="grid grid-cols-7 place-items-center text-gray-500 font-medium">
                        <DaydateList days={days} />
                    </ul>

                    {/* 日付グリッド */}
                    <ul className="grid grid-cols-7 place-items-center place-content-start rounded-md list-none p-0 m-0 gap-x-2 gap-y-2">
                        <DaysList
                            days={days}
                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}
                        />
                    </ul>
                </div>

                {/* 時間選択エリア（日付に応じて表示） */}
                <div className="w-64 pl-8 border-l border-gray-300">
                    <TimeSelector
                        selectedDate={selectedDate}
                        selectedTime={selectedTime}
                        setSelectedTime={setSelectedTime}
                    />
                </div>
            </div>
        </section>
    );
}

export default memo(Calendar);
