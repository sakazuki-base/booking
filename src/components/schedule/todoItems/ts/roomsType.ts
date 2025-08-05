export type roomType = { room: string };

export type roomsType = roomType[];

export type reservedInfoType = {
    isReserved: boolean;
    content: string;
    room?: string;
    person?: string;
    startTime?: string;
    finishTime?: string;
};