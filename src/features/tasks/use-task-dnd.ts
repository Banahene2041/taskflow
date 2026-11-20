"use client";

import { useRef, useState } from "react";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core";

import { useBoardStore } from "@/features/tasks/board-store";
import { resolveDropTarget } from "@/features/tasks/dnd";
import { useTasksByStatus } from "@/features/tasks/hooks";
import type { Task, TaskStatus } from "@/features/tasks/types";

/**
 * Shared board/list DnD:
 * - Cross-status moves happen in onDragOver (once per destination status)
 * - Same-status reorders happen only in onDragEnd (avoids update loops)
 */
export function useTaskDnd(tasks: Task[]) {
  const { reorderTaskLocal, restoreTasks, commitTaskOrder, reorderTask } =
    useBoardStore();
  const tasksByStatusAll = useTasksByStatus(tasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const dragSnapshotRef = useRef<Task[] | null>(null);
  const lastStatusRef = useRef<TaskStatus | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const task =
      tasks.find((item) => item.id === String(event.active.id)) ?? null;
    setActiveTask(task);
    setMoveError(null);
    dragSnapshotRef.current = tasks;
    lastStatusRef.current = task?.status ?? null;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const current = tasks.find((task) => task.id === activeId);
    if (!current) return;

    const overData = over.data.current as
      | { type?: string; status?: TaskStatus; task?: Task }
      | undefined;

    const target = resolveDropTarget(
      overId,
      overData,
      activeId,
      tasksByStatusAll,
      tasks,
    );
    if (!target) return;

    // Same-status sorting is deferred to dragEnd to prevent render loops.
    if (current.status === target.status) return;
    if (lastStatusRef.current === target.status) return;

    lastStatusRef.current = target.status;
    reorderTaskLocal(activeId, target.status, target.index);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const snapshot = dragSnapshotRef.current;
    dragSnapshotRef.current = null;
    lastStatusRef.current = null;
    setActiveTask(null);

    if (!snapshot) return;

    try {
      if (over) {
        const activeId = String(active.id);
        const overId = String(over.id);
        const current = tasks.find((task) => task.id === activeId);

        if (current && overId !== activeId) {
          const overData = over.data.current as
            | { type?: string; status?: TaskStatus; task?: Task }
            | undefined;
          const target = resolveDropTarget(
            overId,
            overData,
            activeId,
            tasksByStatusAll,
            tasks,
          );

          if (target) {
            const fromIndex = tasksByStatusAll[target.status].findIndex(
              (task) => task.id === activeId,
            );
            const needsMove =
              current.status !== target.status || fromIndex !== target.index;

            if (needsMove) {
              await reorderTask(activeId, target.status, target.index);
              return;
            }
          }
        }
      }

      await commitTaskOrder(snapshot);
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "Failed to reorder task.",
      );
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
    lastStatusRef.current = null;
    const snapshot = dragSnapshotRef.current;
    dragSnapshotRef.current = null;
    if (snapshot) restoreTasks(snapshot);
  }

  return {
    activeTask,
    moveError,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
