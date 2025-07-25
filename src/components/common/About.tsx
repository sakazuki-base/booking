import { memo } from "react";
import baseStyle from "../../styles/page.module.css";
import { timeBlockBegin, timeBlockEnd } from "@/types/rooms-atom";

function About() {
    return (
        <div className={baseStyle.theAboutWrapper}>
            <h2>Reservation Rooms 使い方の説明</h2>
            <ol>
                <li>スケジュール欄の日付にあるアイコンをクリック</li>
                <li>表示されたフォーム内の所定項目を選択及び入力</li>
                <li>登録後、スケジュールと上部のタイムテーブルに反映されているかを確認</li>
                <li>必要に応じて登録時のパスワードを使って予約内容を更新</li>
            </ol>
            <div className={baseStyle.about_subInfo}>
                <h3>注意事項</h3>
                <dl>
                    <div>
                        <dt>予約内容の重複禁止</dt>
                        <dd>他の方が先に予約している場合は受け付けません。</dd>
                        <dd>予約終了時間から15分間は予約不可時間となります。この時間を使って室内清掃や部屋の明け渡し準備などを行ってください。</dd>
                    </div>
                    <div>
                        <dt>予約時間外は受付不可</dt>
                        <dd>「{timeBlockBegin}時～{timeBlockEnd}時」の時間帯で予約できます。各部屋ごとのタイムテーブルには当日分の予約内容が反映されます。</dd>
                    </div>
                    <div>
                        <dt>過去の予約内容は随時削除</dt>
                        <dd>当日以前の過去予約内容は削除されます。</dd>
                    </div>
                    <div>
                        <dt>部屋の使用後は清掃をお願いします</dt>
                        <dd>使用後は室内清掃を行ってください。部屋内の棚にアルコールスプレーとタオルが置いてあります。</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}

export default memo(About);