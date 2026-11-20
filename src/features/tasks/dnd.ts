import { BOARD_COLUMNS } from "@/features/tasks/constants";
import { resolveDropIndex } from "@/features/tasks/reorder";
import type { Task, TaskStatus } from "@/features/tasks/types";

export function resolveStatus(
  overId: string,
  overData: { type?: string; status?: TaskStatus; task?: Task } | undefined,
  tasks: Task[],
): TaskStatus | null {
  if (
    (overData?.type === "column" || overData?.type === "section") &&
    overData.status
  ) {
    return overData.status;
  }

  if (BOARD_COLUMNS.some((column) => column.id === overId)) {
    return overId as TaskStatus;
  }

  // Prefer live task lookup over sortable data (which can be stale mid-drag).
  const overTask = tasks.find((task) => task.id === overId);
  if (overTask) return overTask.status;

  if (overData?.type === "task" && overData.task) {
    return overData.task.status;
  }

  return null;
}

export function resolveDropTarget(
  overId: string,
  overData: { type?: string; status?: TaskStatus; task?: Task } | undefined,
  activeId: string,
  tasksByStatus: Record<TaskStatus, Task[]>,
  tasks: Task[],
): { status: TaskStatus; index: number } | null {
  const status = resolveStatus(overId, overData, tasks);
  if (!status) return null;

  const destination = tasksByStatus[status];
  const index = resolveDropIndex(overId, overData?.type, destination, activeId);
  return { status, index };
}

export function diffTaskOrder(
  before: Task[],
  after: Task[],
): Array<{ id: string; status: TaskStatus; position: number }> {
  const beforeById = new Map(before.map((task) => [task.id, task]));
  const updates: Array<{ id: string; status: TaskStatus; position: number }> =
    [];

  for (const task of after) {
    const previous = beforeById.get(task.id);
    if (
      !previous ||
      previous.status !== task.status ||
      previous.position !== task.position
    ) {
      updates.push({
        id: task.id,
        status: task.status,
        position: task.position,
      });
    }
  }

  return updates;
}
