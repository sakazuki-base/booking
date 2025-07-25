export type todoItemType = {
    id: string; // key へ渡すための固有の識別子（uuid：Universally Unique Identifier） useRegiTodoItem.ts にて生成 
    todoID: string; // yyyy/MM/dd
    todoContent: string;
    edit: boolean;
    pw: string;
    person?: string;
    rooms?: string;
    startTime?: string;
    finishTime?: string;
};