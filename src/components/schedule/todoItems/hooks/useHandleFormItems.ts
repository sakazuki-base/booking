import type { SyntheticEvent } from "react";
import { useScrollTop } from "@/hooks/useScrollTop";

export const useHandleFormItems = () => {
  const { scrollTop } = useScrollTop();

  const handleOpenClosedBtnClicked: (
    ctrlHandlerElm: HTMLButtonElement | SyntheticEvent<HTMLFormElement>,
  ) => void = (
    ctrlHandlerElm: HTMLButtonElement | SyntheticEvent<HTMLFormElement>,
  ) => {
    scrollTop();
  };

  return { handleOpenClosedBtnClicked };
};
