export default function TimeSelector({
    selectedDate,
    selectedTime,
    setSelectedTime,
}: {
    selectedDate: string | null;
    selectedTime: number | null;
    setSelectedTime: (time: number) => void;
}) {
    if (!selectedDate) return <p className="text-sm text-gray-600 text-center mt-2">日付を選択してください</p>

    // 選択している日付文字列を作成
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const [year, month, day] = selectedDate.split("/").map(Number);
    const dateObj = new Date(year!, month! - 1, day);
    const weekday = weekdays[dateObj.getDay()];
    const displayDate = `${month}/${day}(${weekday})`;

    // 時間選択リスト(8～22時)
    const startHour = 8;
    const endHour = 22;
    const times = Array.from({ length: (endHour - startHour + 1) }, (_, i) => i + startHour);

    return (
        <div>
            {/* 選択している日付を表示 */}
            <h4>{displayDate}</h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {times.map((hour) => (
                    <button
                        key={hour}
                        onClick={() => setSelectedTime(hour)}
                        className={`px-4 py-2 rounded text-left cursor-pointer border ${selectedTime === hour  ? "bg-blue-600 text-white" : "bg-white text-gray-800 hover:bg-gray-100 border-gray-300"}`}
                    >
                        {hour.toString().padStart(2, "0")}:00
                    </button>
                ))}
            </div>
        </div>
    );
}
