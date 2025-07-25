import { SyntheticEvent } from "react";
import { useViewTodoCtrl } from "./useViewTodoCtrl";
import { useScrollTop } from "@/hooks/useScrollTop";

export const useHandleFormItems = () => {
    const { viewTodoCtrl } = useViewTodoCtrl();
    const { scrollTop } = useScrollTop();

    const handleOpenClosedBtnClicked: (ctrlHandlerElm: HTMLButtonElement | SyntheticEvent<HTMLFormElement>) => void = (ctrlHandlerElm: HTMLButtonElement | SyntheticEvent<HTMLFormElement>) => {
        viewTodoCtrl(ctrlHandlerElm);
        scrollTop();
    }

    return { handleOpenClosedBtnClicked }
}