import Image from "next/image";
import { SyntheticEvent, memo } from "react";
import todoStyle from "./styles/todoStyle.module.css";
import { useViewTodoCtrl } from "./hooks/useViewTodoCtrl";
import { useScrollTop } from "@/hooks/useScrollTop";

import closeIcon from "../../../../public/icons/close.svg";

function TodoCtrlClosedBtn() {
    const { scrollTop } = useScrollTop();
    const { viewTodoCtrl } = useViewTodoCtrl();
    const handleOpenClosedBtnClicked: (btnEl: HTMLButtonElement) => void = (btnEl: HTMLButtonElement) => {
        viewTodoCtrl(btnEl);
        scrollTop();
    }

    return (
        <button className={`${todoStyle.closeBtn} todoCtrlClose`} onClick={(btnEl: SyntheticEvent<HTMLButtonElement>) => handleOpenClosedBtnClicked(btnEl.currentTarget)}>
            <span className="material-symbols-outlined">
                <Image src={closeIcon} alt="閉じるボタン" />
            </span>
        </button>
    );
}

export default memo(TodoCtrlClosedBtn);