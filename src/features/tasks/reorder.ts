import { arrayMove } from "@dnd-kit/sortable";

import type { Task, TaskStatus } from "@/features/tasks/types";

export type TaskOrderUpdate = {
  id: string;
  status: TaskStatus;
  position: number;
};

function sortByPosition(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (a.position !== b.position) return a.position - b.position;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

function renumber(
  columnTasks: Task[],
  status: TaskStatus,
  movedId: string,
): { tasks: Task[]; updates: TaskOrderUpdate[] } {
  const tasks: Task[] = [];
  const updates: TaskOrderUpdate[] = [];
  const now = new Date().toISOString();

  columnTasks.forEach((task, index) => {
    const changed =
      task.id === movedId || task.position !== index || task.status !== status;
    const next: Task = changed
      ? { ...task, status, position: index, updatedAt: now }
      : task;
    tasks.push(next);
    if (changed) {
      updates.push({ id: task.id, status, position: index });
    }
  });

  return { tasks, updates };
}

/**
 * Move a task to a status at a given index and re-number positions
 * for every affected column.
 */
export function reorderTasks(
  tasks: Task[],
  taskId: string,
  toStatus: TaskStatus,
  toIndex: number,
): { tasks: Task[]; updates: TaskOrderUpdate[] } {
  const moving = tasks.find((task) => task.id === taskId);
  if (!moving) return { tasks, updates: [] };

  const fromStatus = moving.status;
  const nextById = new Map<string, Task>();
  const updates: TaskOrderUpdate[] = [];

  if (fromStatus === toStatus) {
    const column = sortByPosition(
      tasks.filter((task) => task.status === fromStatus),
    );
    const oldIndex = column.findIndex((task) => task.id === taskId);
    if (oldIndex < 0 || oldIndex === toIndex) {
      return { tasks, updates: [] };
    }

    const reordered = arrayMove(column, oldIndex, toIndex);
    const result = renumber(reordered, toStatus, taskId);
    for (const task of result.tasks) nextById.set(task.id, task);
    updates.push(...result.updates);
  } else {
    const source = sortByPosition(
      tasks.filter((task) => task.status === fromStatus && task.id !== taskId),
    );
    const destination = sortByPosition(
      tasks.filter((task) => task.status === toStatus && task.id !== taskId),
    );
    const clampedIndex = Math.max(0, Math.min(toIndex, destination.length));
    destination.splice(clampedIndex, 0, { ...moving, status: toStatus });

    const sourceResult = renumber(source, fromStatus, taskId);
    const destResult = renumber(destination, toStatus, taskId);
    for (const task of sourceResult.tasks) nextById.set(task.id, task);
    for (const task of destResult.tasks) nextById.set(task.id, task);
    updates.push(...sourceResult.updates, ...destResult.updates);
  }

  return {
    tasks: tasks.map((task) => nextById.get(task.id) ?? task),
    updates,
  };
}

export function resolveDropIndex(
  overId: string,
  overType: string | undefined,
  columnTasks: Task[],
  activeId: string,
): number {
  if (overType === "section") {
    return columnTasks.filter((task) => task.id !== activeId).length;
  }

  const overIndex = columnTasks.findIndex((task) => task.id === overId);
  if (overIndex < 0) {
    return columnTasks.filter((task) => task.id !== activeId).length;
  }
  return overIndex;
}
