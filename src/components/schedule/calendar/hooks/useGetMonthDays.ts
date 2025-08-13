import type { calendarItemType } from "../ts/calendarItemType";
import { useGetCalndarItem } from "./useGetCalendarItem";
import { usePrevNextDays } from "./usePrevNextDays";

export const useGetMonthDays = () => {
  const { getCalendarItem } = useGetCalndarItem();
  const { prevNextDays } = usePrevNextDays();

  const getMonthDays: (
    year: number,
    month: number,
    setDays: React.Dispatch<React.SetStateAction<calendarItemType[]>>,
  ) => void = (
    year: number,
    month: number,
    setDays: React.Dispatch<React.SetStateAction<calendarItemType[]>>,
  ) => {
    /* 指定した年月の最終日を取得(Day=0だと最終日を返す) */
    const daysInMonth = new Date(year, month, 0).getDate();
    const dayDateBox: calendarItemType[] = [];

    // 指定月の日付情報
    for (let day = 1; day <= daysInMonth; day++) {
      // 年月日と曜日(漢字)を取得
      const newCalendarItem = getCalendarItem(year, month, day);
      // 当月の日付情報リストに追加
      dayDateBox.push(newCalendarItem);
    }

    // 埋め草分（前月・次月）の日付情報
    const theCalendar: calendarItemType[] = prevNextDays(
      year,
      month,
      dayDateBox,
    );
    setDays(theCalendar);
  };

  return { getMonthDays };
};
