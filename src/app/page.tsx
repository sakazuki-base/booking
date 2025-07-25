import Rooms from "../components/rooms/Rooms";
import Calendar from "../components/schedule/calendar/Calendar";

export default async function Home() {
  return (
    <main>
      <Rooms />
      <Calendar />
    </main>
  );
}
