"use client";

import type { todoItemType } from "../../todoItems/ts/todoItemType";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";
import { useAtom } from "jotai";
import { fetchTodoMemoAtom } from "@/types/calendar-atom";
import { useState, useEffect } from "react";
import TodoForm from "../../todoItems/TodoForm";
import { useCheckTimeBlockEntryForm } from "../../todoItems/hooks/useCheckTimeBlockEntryForm";

export default function TimeSelector({
  selectedDate,
  selectedTime,
  setSelectedTime,
}: {
  selectedDate: string | null;
  selectedTime: number | null;
  setSelectedTime: (time: number | null) => void;
}) {
  if (!selectedDate) {
    return (
      <p className="my-2 text-center text-sm text-gray-600">
        日付を選択してください
      </p>
    );
  }

  // 選択している日付文字列を作成
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const [year, month, day] = selectedDate.split("/").map(Number);
  const dateObj = new Date(year!, month! - 1, day);
  const weekday = weekdays[dateObj.getDay()];
  const displayDate = `${month}/${day}(${weekday})`;
  const { checkTimeSchedule } = useCheckTimeBlockEntryForm();

  // 正規化された selectedDate を作成（YYYY/MM/DD）
  const selectedDateNormalized = `${year!.toString().padStart(4, "0")}/${month!.toString().padStart(2, "0")}/${day!.toString().padStart(2, "0")}`;

  // 予約一覧を取得
  const [rawReservations] = useAtom(fetchTodoMemoAtom);
  const [reservations, setReservations] = useState<todoItemType[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (Array.isArray(rawReservations)) {
      setReservations(rawReservations);
      setReady(true);
    }
  }, [rawReservations]);

  if (!ready) return null;

  // 時間選択リスト(8～21時)
  const times = Array.from(
    { length: timeBlockEnd - timeBlockBegin },
    (_, i) => i + timeBlockBegin,
  );

  // 予約済みチェック

  const isReserved = (hour: number): boolean => {
    // 時刻文字列化
    const targetTime = `${hour.toString().padStart(2, "0")}:00`;
    const todoItems: todoItemType = {
      id: "",
      todoContent: "",
      edit: false,
      pw: "",
      rooms: "体育館", // TODO: 場所を可変にできるように
      todoID: selectedDateNormalized,
      startTime: targetTime,
      finishTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
    };
    return checkTimeSchedule(targetTime, todoItems);
  };

  return (
    <div>
      {/* 選択している日付を表示 */}
      <h3 className="my-2 mb-2 text-base font-bold text-gray-800">
        {displayDate}
      </h3>

      {/* 時間ボタンを表示 */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {times.map((hour) => (
          <button
            key={hour}
            onClick={() => {
              setSelectedTime(hour);
            }}
            disabled={isReserved(hour)}
            className={`rounded border px-5 py-1 text-left ${
              isReserved(hour)
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "cursor-pointer border-gray-400 bg-white text-gray-800 hover:bg-gray-200"
            }`}
          >
            {hour.toString().padStart(2, "0")}:00～
            {(hour + 1).toString().padStart(2, "0")}:00{" "}
            {isReserved(hour) ? "×" : "●"}
          </button>
        ))}
      </div>

      {/* 予約登録フォーム */}
      {selectedTime !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm"
          onClick={() => {
            setSelectedTime(null);
          }}
        >
          <div
            className="relative max-h-screen w-full max-w-2xl overflow-y-auto rounded bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()} // モーダル内クリックでは閉じない
          >
            <button
              className="absolute top-4 right-4 text-xl text-gray-500 hover:text-black"
              onClick={() => {
                setSelectedTime(null);
              }}
            >
              ×
            </button>

            <p className="mb-4 text-center text-lg font-semibold">
              {year}/{month!.toString().padStart(2, "0")}/
              {day!.toString().padStart(2, "0")}（{weekday}）
            </p>

            <TodoForm
              props={{
                selectedDate: selectedDate,
                selectedTime: selectedTime,
              }}
              onClose={() => setSelectedTime(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
