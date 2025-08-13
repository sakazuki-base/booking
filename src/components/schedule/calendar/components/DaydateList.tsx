"use client";

import { memo, useMemo } from "react";
import { WEEK_START } from "../hooks/usePrevNextDays"; // 0 or 1

const JP_LABELS = ["日", "月", "火", "水", "木", "金", "土"]; // 表示
const JS_DAYIDX = [0, 1, 2, 3, 4, 5, 6]; // data-daydate用

function DaydateList() {
  // 週開始に合わせてラベルとdata-daydateを回転
  const rotated = useMemo(() => {
    return [...Array(7)].map((_, i) => {
      const w = (i + WEEK_START) % 7; // 0..6
      return { label: JP_LABELS[w], jsDay: JS_DAYIDX[w] };
    });
  }, []);

  return (
    <>
      {rotated.map(({ label, jsDay }, i) => (
        <li
          key={i}
          className="grid min-h-10 w-full place-content-center text-center font-bold"
          data-daydate={jsDay} // 0(日)..6(土)
        >
          {label}
        </li>
      ))}
    </>
  );
}

export default memo(DaydateList);
