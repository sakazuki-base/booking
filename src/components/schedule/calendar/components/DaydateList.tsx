import { memo, useMemo } from "react";
import type { calendarItemType } from "../ts/calendarItemType";

function DaydateList({ days }: { days: calendarItemType[] }) {
    const theOneWeek = useMemo(() => {
        return days.filter((_, i) => i < 7);
    }, [days]);

    return (
        <>
            {theOneWeek.map(day => (
                <li key={day.day} className="min-h-10 grid place-content-center w-full text-center font-bold " data-daydate={day.dayDateNum}>{day.dayDate}</li>
            ))}
        </>
    );
}

export default memo(DaydateList);
