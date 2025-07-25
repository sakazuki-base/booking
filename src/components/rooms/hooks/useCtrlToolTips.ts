import { SyntheticEvent } from "react";
import { useAtom } from "jotai";
import { roomsInfoToolTipAtom } from "@/types/rooms-atom";

export const useCtrlToolTips = () => {
    // ツールチップ内容（予約情報）
    const [roomsInfo, setRoomsInfo] = useAtom(roomsInfoToolTipAtom);

    // ツールチップの座標操作
    const _ctrlToolTips: (event: SyntheticEvent) => void = (event: SyntheticEvent) => {
        if (roomsInfo?.length === 0) {
            return;
        }

        // x座標の取得
        let xPos: number = 0;
        if (event.nativeEvent instanceof MouseEvent) {
            xPos = event.nativeEvent.clientX / 1.5;
        } else if (event.nativeEvent instanceof TouchEvent) {
            xPos = event.nativeEvent.changedTouches[0].clientX;
        }

        // y座標の取得
        let yPos: number = 0;
        if (event.nativeEvent instanceof MouseEvent) {
            yPos = event.nativeEvent.clientY / 1.5;
        } else if (event.nativeEvent instanceof TouchEvent) {
            yPos = event.nativeEvent.changedTouches[0].clientY;
        }

        const roomInfoToolTip: HTMLElement | null = document.querySelector('.roomInfoToolTip');
        if (roomInfoToolTip && (xPos > 0 && yPos > 0)) {
            roomInfoToolTip.style.cssText = `transform:translate(${xPos}px, ${yPos}px);`;
        }
    }

    // ツールチップの実行イベントリスナー（表示）
    const hoverEventListener: (e: SyntheticEvent) => void = (e: SyntheticEvent) => {
        const targetDataInfo: string | null = e.currentTarget.getAttribute('data-info');
        if (targetDataInfo) {
            _ctrlToolTips(e)
            setRoomsInfo(targetDataInfo);
        }
    }

    // ツールチップの実行イベントリスナー（非表示）
    const leaveEventListener: () => void = () => {
        setRoomsInfo('');
    }

    return { hoverEventListener, leaveEventListener }
}