import { atom } from "jotai";
import type { roomsType } from "../components/rooms/ts/roomsType";

export const timeBlockBegin: number = 9; // 予約可能-開始時間
export const timeBlockEnd: number = 21;  // 予約可能-終了時間

//「：」より後の文字がスケジュールテーブルに表示されます
const rooms: roomsType = [
    { room: '会議室：2F' },
    { room: '多目的ホール：3F' },
    { room: '応接室：4F' }
];
export const roomsAtom = atom<roomsType>(rooms);

// 予約内容確認用のツールチップ
export const roomsInfoToolTipAtom = atom<string | undefined>(undefined);