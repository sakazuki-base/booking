"use client";

import Image from "next/image";
import { memo } from "react";
import { useState } from "react";
import { useScrollTop } from "@/hooks/useScrollTop";
import { useGetMonthDays } from "../hooks/useGetMonthDays";
import type { calendarItemType } from "../ts/calendarItemType";

import chevron_left from "../../../../../public/icons/chevron_left.svg";
import chevron_right from "../../../../../public/icons/chevron_right.svg";

type PrevNextMonthBtnsProps = {
  className: string;
  ctrlYear: number;
  setCtrlYear: React.Dispatch<React.SetStateAction<number>>;
  ctrlMonth: number;
  setCtrlMonth: React.Dispatch<React.SetStateAction<number>>;
};

function PrevNextMonthBtns({
  className,
  ctrlYear,
  setCtrlYear,
  ctrlMonth,
  setCtrlMonth,
}: PrevNextMonthBtnsProps) {
  const { scrollTop } = useScrollTop();

  const nextCalendarView: () => void = () => {
    if (ctrlMonth === 12) {
      setCtrlYear(ctrlYear + 1);
      setCtrlMonth(1);
    } else {
      setCtrlMonth(ctrlMonth + 1);
    }
    scrollTop();
  };

  const prevCalendarView: () => void = () => {
    if (ctrlMonth === 1) {
      setCtrlYear(ctrlYear - 1);
      setCtrlMonth(12);
    } else {
      setCtrlMonth(ctrlMonth - 1);
    }
    scrollTop();
  };

  const { getMonthDays } = useGetMonthDays();
  const [days, setDays] = useState<calendarItemType[]>([]);

  const jumpThisMonth = () => {
    const thisYear = new Date().getFullYear();
    const thisMonth = new Date().getMonth() + 1;
    setCtrlYear(thisYear);
    setCtrlMonth(thisMonth);
    getMonthDays(thisYear, thisMonth, setDays);
    window.scrollTo(0, 0);
  };

  return (
    <div className={className}>
      <button
        className="rounded bg-gray-700 px-4 py-1 text-white"
        type="button"
        onClick={prevCalendarView}
      >
        <span className="align-middle [filter:brightness(3)]">
          <Image src={chevron_left} alt="前月ボタン" />
        </span>
      </button>

      <button
        className="rounded bg-gray-700 px-4 py-1 text-white"
        type="button"
        onClick={jumpThisMonth}
      >
        今月
      </button>

      <button
        className="rounded bg-gray-700 px-4 py-1 text-white"
        type="button"
        onClick={nextCalendarView}
      >
        <span className="align-middle [filter:brightness(3)]">
          <Image src={chevron_right} alt="次月ボタン" />
        </span>
      </button>
    </div>
  );
}

export default memo(PrevNextMonthBtns);
