"use client";

import { memo, useMemo, useState } from "react";
import roomStyle from "./styles/roomstyle.module.css";
import { useAtom } from "jotai";
import { roomsAtom, roomsInfoToolTipAtom } from "@/types/rooms-atom";
import { todoMemoAtom } from "@/types/calendar-atom";
import About from "../common/About";
import TimeTable from "./components/TimeTable";
import MultiTimeTableCtrlBtns from "./components/MultiTimeTableCtrlBtns";

function RoomsAboutViewer() {
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const aboutLightBox: () => void = () => {
    setIsAboutOpen(!isAboutOpen);
  };

  return (
    <div
      role="button"
      className={
        isAboutOpen
          ? `${roomStyle.aboutContainer} ${roomStyle.onView}`
          : roomStyle.aboutContainer
      }
      onClick={aboutLightBox}
    >
      <h2>◎ 使い方の説明や注意事項</h2>
      <section>
        <About />
      </section>
    </div>
  );
}

function Rooms() {
  const [rooms] = useAtom(roomsAtom);

  /**
   * 以下のエラー（Atom 呼び出しがループしている）対策として親元コンポーネントで当該Atomを読み込んで props drilling（propsのバケツリレー）する
   * React Hook "useAtom" may be executed more than once. Possibly because it is called in a loop. React Hooks must be called in the exact same order in every component render.
   */
  const [todoMemo] = useAtom(todoMemoAtom);

  // 以下があるとRoomsのエリアに大きく黒いツールチップが出てきてしまう。
  //const [roomsInfo] = useAtom(roomsInfoToolTipAtom);

  const today: number = useMemo(() => new Date().getDate(), []);
  const [ctrlMultiTimeTable, setCtrlMultiTimeTable] = useState<number>(today);

  return (
    <section className={roomStyle.roomWrapper}>
      {/* {typeof roomsInfo !== 'undefined' &&
                <p className={`roomInfoToolTip ${roomsInfo.length > 0 ?
                    `${roomStyle.roomInfoToolTip} ${roomStyle.onView}` :
                    roomStyle.roomInfoToolTip}`
                }>{roomsInfo}</p>
            } */}
      <MultiTimeTableCtrlBtns
        props={{
          ctrlMultiTimeTable: ctrlMultiTimeTable,
          setCtrlMultiTimeTable: setCtrlMultiTimeTable,
          today: today,
        }}
      />
      {rooms.map((room, i) => (
        <div key={i} className={roomStyle.roomContainer}>
          <p>{room.room}</p>
          <div className={roomStyle.timeScheduleWrapper}>
            <TimeTable
              props={{
                room: room.room,
                todoMemo: todoMemo,
                ctrlMultiTimeTable: ctrlMultiTimeTable,
              }}
            />
          </div>
        </div>
      ))}
      <RoomsAboutViewer />
    </section>
  );
}

export default memo(Rooms);
