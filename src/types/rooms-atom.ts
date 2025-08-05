import { atom } from "jotai";
import type { roomsType } from "../components/schedule/todoItems/ts/roomsType";

export const timeBlockBegin: number = 8; // 予約可能-開始時間
export const timeBlockEnd: number = 22; // 予約可能-終了時間

//「：」より後の文字がスケジュールテーブルに表示されます
const rooms: roomsType = [
  { room: "体育館" },
  { room: "キャンプ場" },
  { room: "教室" },
];
export const roomsAtom = atom<roomsType>(rooms);

// 予約内容確認用のツールチップ
export const roomsInfoToolTipAtom = atom<string | undefined>(undefined);
