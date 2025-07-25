import todoStyle from "./styles/todoStyle.module.css";
import { Fragment, memo, SyntheticEvent, useMemo } from "react";
import { todoItemType } from "./ts/todoItemType";
import { useAtom } from "jotai";
import { isDesktopViewAtom, todoMemoAtom } from "@/types/calendar-atom";
import TodoItems from "./TodoItems";
import { useCreateTimeSpace } from "@/hooks/useCreateTimeSpace";
import { useScrollTop } from "@/hooks/useScrollTop";

function TodoList({ todoID }: { todoID: string }) {
    const [todoMemo] = useAtom(todoMemoAtom);
    const [desktopView] = useAtom(isDesktopViewAtom);

    const { adjustViewerTimeSpace } = useCreateTimeSpace();
    const { scrollTop } = useScrollTop();

    /* モーダル表示関連（ToDoの詳細表示オン・オフ）*/
    const OnViewModalWindow: (viewerParentElm: HTMLElement) => void = (viewerParentElm: HTMLElement) => {
        const modalWindow: Element | null = viewerParentElm.querySelector(`.${todoStyle.modalWindow}`);
        modalWindow?.classList.add(`${todoStyle.modalWindowOnView}`);
    }

    const sortedTodoMemo: todoItemType[] = useMemo(() => {
        return [...todoMemo].sort((ahead, behind) => {
            if (typeof ahead.startTime !== 'undefined' && typeof behind.startTime !== 'undefined') {
                const aheadStartTime = parseInt(ahead.startTime.replace(':', ''));
                const behindStartTime = parseInt(behind.startTime.replace(':', ''));
                return aheadStartTime - behindStartTime;
            }
            // else の場合は（0を返して）順序変更なし
            return 0;
        });
    }, [todoMemo]);

    return (
        <>
            {sortedTodoMemo.length > 0 &&
                <ul className={todoStyle.todoLists}>
                    {sortedTodoMemo.map(todoItem => (
                        <Fragment key={todoItem.id}>
                            {/* yyyy/MM/dd が一致した場合 */}
                            {todoItem.todoID === todoID ?
                                <li className={todoStyle.todoList}
                                    onClick={(liElm: SyntheticEvent<HTMLLIElement>) => {
                                        OnViewModalWindow(liElm.currentTarget);
                                        scrollTop();
                                    }}>
                                    {desktopView ?
                                        <div className={todoStyle.editTargetContent}>
                                            {todoItem.todoContent.length > 6 ?
                                                <p className={todoStyle.editTargetStr}>{todoItem.todoContent.slice(0, 6)}...</p> :
                                                <p className={todoStyle.editTargetStr}>{todoItem.todoContent}</p>
                                            }
                                            {todoItem.rooms &&
                                                // （&#91; = [）/（&#93; = ]）
                                                <span>&#91;{
                                                    todoItem.rooms.includes('：') ?
                                                        todoItem.rooms.split('：')[1] :
                                                        todoItem.rooms
                                                }&#93;</span>
                                            }
                                            {(todoItem.startTime && todoItem.finishTime) ?
                                                <span>{todoItem.startTime} ～ {adjustViewerTimeSpace(todoItem.finishTime)}</span>
                                                : null
                                            }
                                        </div> :
                                        <div className={todoStyle.isMobileNotice}>
                                            {todoItem.rooms &&
                                                <span>&#91;{
                                                    todoItem.rooms.includes('：') ?
                                                        todoItem.rooms.split('：')[1] :
                                                        todoItem.rooms
                                                }&#93;</span>
                                            }
                                            {todoItem.todoContent.length > 4 ?
                                                <p>{todoItem.todoContent.slice(0, 4)}...</p> :
                                                <p>{todoItem.todoContent}</p>
                                            }
                                        </div>
                                    }
                                    <TodoItems todoItem={todoItem} />
                                </li>
                                : null
                            }
                        </Fragment>
                    ))}
                </ul>
            }
        </>
    );
}

export default memo(TodoList);