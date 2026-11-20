import { BoardColumn } from "@/components/board/board-column";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { BOARD_COLUMNS } from "@/features/tasks/constants";
import type { Task, TaskStatus } from "@/features/tasks/types";

type BoardProps = {
  tasks: Task[];
};

function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grouped: Record<TaskStatus, Task[]> = {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  };

  for (const task of tasks) {
    grouped[task.status].push(task);
  }

  return grouped;
}

export function Board({ tasks }: BoardProps) {
  const tasksByStatus = groupTasksByStatus(tasks);

  return (
    <section className="space-y-4">
      <BoardToolbar taskCount={tasks.length} />

      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4 px-1">
          {BOARD_COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
