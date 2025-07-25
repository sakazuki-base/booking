import { calendarItemType } from "../../calendar/ts/calendarItemType";

export const useRestrictReservationTerm = () => {
    const restrictReservationTerm: (day: calendarItemType) => boolean = (day: calendarItemType) => {
        const date: Date = new Date();
        let ReservableTermYear: number = date.getFullYear();
        let ReservableTermMonth: number = date.getMonth() + 7;

        // 12月を超える場合は月と年を調整
        if (ReservableTermMonth > 12) {
            ReservableTermYear = date.getFullYear() + 1; // 翌年
            ReservableTermMonth = ReservableTermMonth - 12; // 月を調整
        }

        const configReservableTerm_YearMonth: number = parseInt(`${ReservableTermYear}${(ReservableTermMonth).toString().padStart(2, '0')}`);
        const dayDate: number = parseInt(`${day.year}${day.month.toString().padStart(2, '0')}`);

        const isValidationReservable: boolean = configReservableTerm_YearMonth < dayDate;
        if (isValidationReservable) {
            alert(`6ヶ月以内（${ReservableTermYear}/${ReservableTermMonth}まで）が予約可能（受け付け）期間です。`);
            return true;
        }

        return false;
    }

    return { restrictReservationTerm }
}