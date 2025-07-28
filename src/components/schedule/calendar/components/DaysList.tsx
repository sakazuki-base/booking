import React, { memo, useMemo } from "react";
import type { calendarItemType } from "../ts/calendarItemType";

function DaysList({
  days,
  selectedDate,
  setSelectedDate,
}: {
  days: calendarItemType[];
  selectedDate: string | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const handleDayClick = (day: calendarItemType) => {
    const key = `${day.year}/${day.month}/${day.day}`;
    setSelectedDate((prev) => (prev === key ? null : key));
  };

  const todayDate = useMemo(() => {
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
