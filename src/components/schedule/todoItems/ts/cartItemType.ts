export type cartItemType = {
  id?: string; // UUID
  rooms: string; // 予約種別
  date: string; // 日付(yyyy/MM/dd)
  startTime?: string; // 予約開始時間
  finishTime?: string; // 予約終了時間
  note?: string; // メモ
};
