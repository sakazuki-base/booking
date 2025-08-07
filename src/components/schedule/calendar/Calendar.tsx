"use client";

import { memo, useEffect, useState } from "react";
import type { calendarItemType } from "./ts/calendarItemType";
import { useAtom, useSetAtom } from "jotai";
import { fetchTodoMemoAtom } from "@/types/calendar-atom";
import PrevNextMonthBtns from "./components/PrevNextMonthBtns";
import DaydateList from "./components/DaydateList";
import DaysList from "./components/DaysList";
import { useGetMonthDays } from "./hooks/useGetMonthDays";
import TimeSelector from "./components/TimeSelector";

function Calendar() {
  const setFetchTodoMemo = useSetAtom(fetchTodoMemoAtom);

  // 予約一覧を初期化（Hydration Mismatch 防止）
  useEffect(() => {
    const fetchReservations = async () => {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setFetchTodoMemo(data);
    };
    fetchReservations();
  }, [setFetchTodoMemo]);

  const currYear = new Date().getFullYear();
  const currMonth = new Date().getMonth() + 1;
  const [ctrlYear, setCtrlYear] = useState<number>(currYear);
  const [ctrlMonth, setCtrlMonth] = useState<number>(currMonth);
  const [days, setDays] = useState<calendarItemType[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const { getMonthDays } = useGetMonthDays();

  useEffect(() => {
    getMonthDays(ctrlYear, ctrlMonth, setDays);
  }, [ctrlMonth]);

  return (
    <section className="mx-auto mb-20 w-full max-w-screen-md">
      <h2 className="mt-4 mb-2 px-2 text-2xl font-bold">体育館予約</h2>

      <h3 className="mt-4 mb-2 px-2 text-xl font-bold">
        {ctrlYear}年{ctrlMonth}月
      </h3>

      {/* 左右分割レイアウト用の全体コンテナ */}
      <div className="mt-6 flex flex-col gap-8 bg-gray-50 p-4 md:flex-row">
        {/* カレンダー（日付選択）エリア */}
        <div className="w-full md:w-180">
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
        <div className="mt-8 w-full md:mt-0 md:w-64 md:border-l md:border-gray-300 md:pl-8">
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
