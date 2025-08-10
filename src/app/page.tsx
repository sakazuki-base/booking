import { Suspense } from "react";
import Calendar from "../components/schedule/calendar/Calendar";

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div className="p-6">読み込み中...</div>}>
        <Calendar />
      </Suspense>
    </main>
  );
}
