import { memo, useMemo } from "react";
import { usePathname } from "next/navigation";

function ViewCurrentTimeTableDay({ ctrlMultiTimeTable, isLastWeek }: { ctrlMultiTimeTable: number, isLastWeek: boolean }) {
    const pathName: string = usePathname();

    const thisMonth: number = useMemo(() => new Date().getMonth() + 1, []);

    return (
        <>
            {pathName.length === 1 &&
                // [Minified React error #418 対応](https://react.dev/reference/react-dom/client/hydrateRoot#suppressing-unavoidable-hydration-mismatch-errors)
                <p suppressHydrationWarning={true}>- <b>{isLastWeek && ctrlMultiTimeTable <= 7 ? thisMonth + 1 : thisMonth}/{ctrlMultiTimeTable}</b> の予約内容（翌週まで確認可能）</p>
            }
        </>
    );
}

export default memo(ViewCurrentTimeTableDay);