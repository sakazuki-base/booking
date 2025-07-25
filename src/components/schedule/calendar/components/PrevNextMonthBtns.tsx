import Image from "next/image";
import { memo } from "react";
import { useScrollTop } from "@/hooks/useScrollTop";

import chevron_left from "../../../../../public/icons/chevron_left.svg";
import chevron_right from "../../../../../public/icons/chevron_right.svg";

type btnsPropsType = {
    className: string;
    ctrlMonth: number;
    setCtrlMonth: React.Dispatch<React.SetStateAction<number>>;
    ctrlYear: number;
    setCtrlYear: React.Dispatch<React.SetStateAction<number>>;
};

const btnStyle: object = {
    'padding': '.5em 1em'
};

const btnIconStyle: object = {
    'verticalAlign': 'middle',
    'filter': 'brightness(3)'
};

function PrevNextMonthBtns({ props }: { props: btnsPropsType }) {
    const { className, ctrlMonth, setCtrlMonth, setCtrlYear, ctrlYear } = props;

    const { scrollTop } = useScrollTop();

    const nextCalendarView: () => void = () => {
        if (ctrlMonth === 12) {
            setCtrlYear(ctrlYear + 1);
            setCtrlMonth(1);
        } else {
            setCtrlMonth(ctrlMonth + 1);
        }

        scrollTop();
    }

    const prevCalendarView: () => void = () => {
        if (ctrlMonth === 1) {
            setCtrlYear(ctrlYear - 1);
            setCtrlMonth(12);
        } else {
            setCtrlMonth(ctrlMonth - 1);
        }

        scrollTop();
    }

    return (
        <div className={className}>
            <button type="button" style={btnStyle} onClick={prevCalendarView}><span style={btnIconStyle}>
                <Image src={chevron_left} alt="前月ボタン" />
            </span></button>
            <button type="button" style={btnStyle} onClick={nextCalendarView}><span style={btnIconStyle}>
                <Image src={chevron_right} alt="次月ボタン" />
            </span></button>
        </div>
    );
}

export default memo(PrevNextMonthBtns);