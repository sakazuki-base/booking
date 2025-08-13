import type { calendarItemType } from "../ts/calendarItemType";
import { useGetCalndarItem } from "./useGetCalendarItem";

/**
 * 週の開始曜日を定数で切替
 * 0 = 日曜始まり, 1 = 月曜始まり
 */
export const WEEK_START: 0 | 1 = 1;

/**
 * getDay: 0=日..6=土 を、開始曜日基準の0..6に並べ替える
 * 例: weekStartsOn=1(月) のとき、月0, 火1, ... 日6 になる
 */
const toWeekIndex = (weekday: number, weekStartsOn: 0 | 1) =>
  (weekday - weekStartsOn + 7) % 7;

export const usePrevNextDays = () => {
  const { getCalendarItem } = useGetCalndarItem();

  const prevNextDays: (
    year: number,
    month: number,
    dayDateBox: calendarItemType[],
    weekStartsOn?: 0 | 1,
  ) => calendarItemType[] = (
    year,
    month,
    dayDateBox,
    weekStartsOn = WEEK_START,
  ) => {
    if (!dayDateBox?.length) return [];

    const targetPrevDays: calendarItemType[] = [];
    const targetNextDays: calendarItemType[] = [];

    // 現在月の1日目と最終日の「開始曜日基準インデックス」を算出
    const firstDay = dayDateBox[0];
    const lastDay = dayDateBox[dayDateBox.length - 1];

    const firstIdx = toWeekIndex(firstDay!.dayDateNum, weekStartsOn);
    const lastIdx = toWeekIndex(lastDay!.dayDateNum, weekStartsOn);

    // 先頭側に必要な前月埋め日数（先頭インデックスそのもの）
    const prevFill = firstIdx; // 0..6
    // 末尾側に必要な翌月埋め日数（6 - 末尾インデックス）
    const nextFill = 6 - lastIdx; // 0..6

    // 前月埋め：前月の最終日から prevFill 日分を並べる
    if (prevFill > 0) {
      const prevFinalDay: number = new Date(year, month - 1, 0).getDate(); // 前月末日
      const startDay = prevFinalDay - prevFill + 1;
      for (let d = startDay; d <= prevFinalDay; d++) {
        const newItem = getCalendarItem(year, month - 1, d, true);
        targetPrevDays.push(newItem);
      }
    }

    // 翌月埋め：翌月の1日から nextFill 日分を並べる
    if (nextFill > 0) {
      for (let d = 1; d <= nextFill; d++) {
        const newItem = getCalendarItem(year, month + 1, d, true);
        targetNextDays.push(newItem);
      }
    }

    // 連結して返却（前月埋め + 当月 + 翌月埋め）
    return [...targetPrevDays, ...dayDateBox, ...targetNextDays];
  };

  return { prevNextDays };
};
