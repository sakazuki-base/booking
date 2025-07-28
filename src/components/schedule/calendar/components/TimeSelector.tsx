export default function TimeSelector({
  selectedDate,
  selectedTime,
  setSelectedTime,
}: {
  selectedDate: string | null;
  selectedTime: number | null;
  setSelectedTime: (time: number) => void;
}) {
  if (!selectedDate) {
    return (
      <p className="my-2 text-center text-sm text-gray-600">
        日付を選択してください
      </p>
    );
  }

  // 選択している日付文字列を作成
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const [year, month, day] = selectedDate.split("/").map(Number);
  const dateObj = new Date(year!, month! - 1, day);
  const weekday = weekdays[dateObj.getDay()];
  const displayDate = `${month}/${day}(${weekday})`;

  // 時間選択リスト(8～22時)
  const startHour = 8;
  const endHour = 22;
  const times = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => i + startHour,
  );

  return (
    <div>
      {/* 選択している日付を表示 */}
      <p className="my-2 text-sm text-gray-600">{displayDate}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {times.map((hour) => (
          <button
            key={hour}
            onClick={() => setSelectedTime(hour)}
            className={`cursor-pointer rounded border px-4 py-2 text-left ${selectedTime === hour ? "bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-800 hover:bg-gray-100"}`}
          >
            {hour.toString().padStart(2, "0")}:00
          </button>
        ))}
      </div>
    </div>
  );
}
