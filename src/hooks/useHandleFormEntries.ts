import { ChangeEvent } from "react";
import { useHandleInputValueSanitize } from "./useHandleInputValueSanitize";

type handleFormEntriesType = <T>(
    targetElm: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    targetFormEntries: T,
    setEntries: React.Dispatch<React.SetStateAction<T>>
) => void

export const useHandleFormEntries = () => {
    // サニタイズしたいラベルを用意（input の id属性名）
    const isCheckIdAttr_forSanitize = ['todoContent', 'pw'];
    const { handleInputValueSanitize } = useHandleInputValueSanitize();

    /* <T>：ジェネリクスで任意の型を指定 */
    const handleFormEntries: handleFormEntriesType = <T>(
        targetElm: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        targetFormEntries: T,
        setEntries: React.Dispatch<React.SetStateAction<T>>
    ) => {
        // id属性からプロパティ名を取得 
        const type: string = targetElm.currentTarget.id;
        let value: string | number | boolean = targetElm.currentTarget.value;

        // サニタイズが必要なラベルには実施
        if (isCheckIdAttr_forSanitize.includes(type)) {
            value = handleInputValueSanitize(targetElm.currentTarget.value);
        }

        const newEntries: T = {
            ...targetFormEntries,
            [type]: value
        }
        setEntries(newEntries);
    }

    return { handleFormEntries }
}