import { memo, useMemo } from "react";
import calendarStyle from "../styles/calendarStyle.module.css";
import type { calendarItemType } from "../ts/calendarItemType";

function DaydateList({ days }: { days: calendarItemType[] }) {
    const theOneWeek = useMemo(() => {
        return days.filter((_, i) => i < 7);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [days]);

    return (
        <>
            {theOneWeek.map(day => (
                <li key={day.day} className={calendarStyle.theOneWeek} data-daydate={day.dayDateNum}>{day.dayDate}</li>
            ))}
        </>
    );
}

export default memo(DaydateList);