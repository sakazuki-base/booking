"use client";

import React, { memo, useMemo } from "react";
import type { calendarItemType } from "../ts/calendarItemType";

function DaysList({
  days, // 当月の日付リスト
  selectedDate, // 選択日の現在値
  setSelectedDate, // 選択日の更新関数
}: {
  days: calendarItemType[];
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
}) {
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

  return (
    <>
      {days.map((day) => {
        const key = `${day.year}/${day.month}/${day.day}`;
        const isSelected = selectedDate === key;
        const thisDate = new Date(day.year, day.month - 1, day.day);
        const isPast = thisDate < todayDate;

        return (
          <li key={key} className="aspect-square w-full">
            {isPast ? (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                {day.day}
              </div>
            ) : (
              <button
                onClick={() => handleDayClick(day)}
                className={`flex h-full w-full items-center justify-center rounded transition ${isSelected ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-400"} `}
              >
                {day.day}
              </button>
            )}
          </li>
        );
      })}
    </>
  );
}

export default memo(DaysList);
