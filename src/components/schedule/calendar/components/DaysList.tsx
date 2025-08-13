"use client";

import React, { memo, useMemo } from "react";
import type { calendarItemType } from "../ts/calendarItemType";
import { useAtom } from "jotai";
import { fetchTodoMemoAtom } from "@/types/calendar-atom";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";
import type { todoItemType } from "../../todoItems/ts/todoItemType";
import { useCheckTimeBlockEntryForm } from "../../todoItems/hooks/useCheckTimeBlockEntryForm";

function DaysList({
  days, // 当月の日付リスト
  selectedDate, // 選択日の現在値
  setSelectedDate, // 選択日の更新関数
  viewMonth, // 表示中の月（当月判定用）
}: {
  days: calendarItemType[];
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
  viewMonth: number;
}) {
  // jotaiから直接予約一覧を取得
  const [reservations] = useAtom(fetchTodoMemoAtom);

  const { checkTimeSchedule } = useCheckTimeBlockEntryForm();

  // 日付ボタン押下で日付選択状態をトグルで切り替え
  const handleDayClick = (day: calendarItemType) => {
    const key = `${day.year}/${day.month}/${day.day}`;
    setSelectedDate((prev) => (prev === key ? null : key));
  };

  // 初回マウント時の日付を保持
  const todayDate = useMemo(() => {
    // 現在日時から日付のみを抽出
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const isAllReserved = (year: number, month: number, day: number) => {
    const dateKey = `${year.toString().padStart(4, "0")}/${month
      .toString()
      .padStart(2, "0")}/${day.toString().padStart(2, "0")}`;
    for (let hour = timeBlockBegin; hour < timeBlockEnd; hour++) {
      const targetTime = `${hour.toString().padStart(2, "0")}:00`;
      const todoItems: todoItemType = {
        id: "",
        todoContent: "",
        edit: false,
        pw: "",
        rooms: "体育館",
        todoID: dateKey,
        startTime: targetTime,
        finishTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
      };

      // ひとつでも空きがあればfalse
      if (!checkTimeSchedule(targetTime, todoItems)) return false;
    }
    // 全て埋まっていればtrue
    return true;
  };

  return (
    <>
      {days.map((day) => {
        const key = `${day.year}/${day.month}/${day.day}`;
        const isSelected = selectedDate === key;
        const thisDate = new Date(day.year, day.month - 1, day.day);
        const isPast = thisDate < todayDate;
        const isOtherMonth = day.month !== viewMonth;
        const labelText = isOtherMonth
          ? `${day.month}/${day.day}`
          : `${day.day}`;

        // 週末判定
        const isSunday = day.dayDateNum === 0;
        const isSaturday = day.dayDateNum === 6;

        // 未選択時の基準クラス（明度は現状のGray-200相当を維持）
        const baseBtnClass = isSunday
          ? "bg-red-100 text-gray-800 hover:bg-red-300"
          : isSaturday
            ? "bg-blue-100 text-gray-800 hover:bg-blue-300"
            : "bg-gray-200 text-gray-800 hover:bg-gray-400";

        // 全枠埋まっていれば×、どこか空いていれば●
        let signal = "●";
        if (isAllReserved(day.year, day.month, day.day)) {
          signal = "×";
        }

        return (
          <li key={key} className="aspect-square w-full">
            {isPast ? (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                {labelText}
              </div>
            ) : (
              <button
                onClick={() => handleDayClick(day)}
                className={`flex h-full w-full items-center justify-center rounded transition ${isSelected ? "bg-gray-700 text-white" : baseBtnClass} `}
              >
                <span className="grid h-full w-full grid-rows-2 place-items-center gap-0">
                  <span className="self-end text-base leading-none">
                    {labelText}
                  </span>
                  <span className="self-center text-xs leading-none">
                    {signal}
                  </span>
                </span>
              </button>
            )}
          </li>
        );
      })}
    </>
  );
}

export default memo(DaysList);
