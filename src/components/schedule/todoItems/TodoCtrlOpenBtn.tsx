import Image from "next/image";
import { SyntheticEvent, memo } from "react";
import todoStyle from "./styles/todoStyle.module.css";
import { calendarItemType } from "../calendar/ts/calendarItemType";
import { useScrollTop } from "@/hooks/useScrollTop";
import { useViewTodoCtrl } from "./hooks/useViewTodoCtrl";
import { useRestrictReservationTerm } from "./hooks/useRestrictReservationTerm";

import add_circle from "../../../../public/icons/add_circle.svg";

function TodoCtrlOpenBtn({ day }: { day: calendarItemType }) {
    const { scrollTop } = useScrollTop();
    const { viewTodoCtrl } = useViewTodoCtrl();
    const { restrictReservationTerm } = useRestrictReservationTerm();

    const handleOpenClosedBtnClicked: (btnEl: HTMLButtonElement) => void = (btnEl: HTMLButtonElement) => {
        const isRestrictReservationTerm: boolean = restrictReservationTerm(day);
        if (isRestrictReservationTerm) {
            return;
        }

        viewTodoCtrl(btnEl);
        scrollTop();
    }

    return (
        <button className={`${todoStyle.openBtn} todoCtrlOpen`}
            onClick={(btnEl: SyntheticEvent<HTMLButtonElement>) => handleOpenClosedBtnClicked(btnEl.currentTarget)}>
            <span>
                <Image src={add_circle} alt="登録フォーム表示ボタン" />
            </span>
        </button>
    );
}

export default memo(TodoCtrlOpenBtn);