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
    <section className="mx-auto mb-20 w-full max-w-screen-lg">
      <h2 className="mb-2 text-xl font-bold">
        {ctrlYear}年{ctrlMonth}月
      </h2>

      {/* 左右分割レイアウト用の全体コンテナ */}
      <div className="mt-6 flex flex-row gap-8 bg-gray-50 p-4">
        {/* カレンダー（日付選択）エリア */}
        <div className="w-full">
          <PrevNextMonthBtns
            className="flex justify-between"
            ctrlYear={ctrlYear}
            setCtrlYear={setCtrlYear}
            ctrlMonth={ctrlMonth}
            setCtrlMonth={setCtrlMonth}
          />

          {/* 曜日ヘッダー */}
          <ul className="my-4 grid grid-cols-7 place-items-center font-medium text-gray-500">
            <DaydateList days={days} />
          </ul>

          {/* 日付グリッド */}
          <ul className="m-0 grid list-none grid-cols-7 place-content-start place-items-center gap-x-2 gap-y-2 rounded-md p-0">
            <DaysList
              days={days}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
            />
          </ul>
        </div>

        {/* 時間選択エリア（日付に応じて表示） */}
        <div className="w-64 border-l border-gray-300 pl-8">
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
