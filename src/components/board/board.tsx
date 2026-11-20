"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { BoardColumn } from "@/components/board/board-column";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { TaskCard } from "@/components/board/task-card";
import { BOARD_COLUMNS } from "@/features/tasks/constants";
import { useBoardStore } from "@/features/tasks/board-store";
import { useFilteredTasks, useTasksByStatus } from "@/features/tasks/hooks";
import type { Task, TaskStatus } from "@/features/tasks/types";

type BoardProps = {
  onOpenTask: (task: Task) => void;
  onCreateTask: (status?: TaskStatus) => void;
};

export function Board({ onOpenTask, onCreateTask }: BoardProps) {
  const { tasks, members, labels, filters, setFilters, moveTask } =
    useBoardStore();
  const filteredTasks = useFilteredTasks(tasks, filters);
  const tasksByStatus = useTasksByStatus(filteredTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const activeIdSet = useMemo(
    () => new Set(filteredTasks.map((task) => task.id)),
    [filteredTasks],
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((item) => item.id === event.active.id);
    setActiveTask(task ?? null);
    setMoveError(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = String(active.id);
    if (!activeIdSet.has(taskId)) return;

    const overData = over.data.current as
      | { type?: string; status?: TaskStatus; task?: Task }
      | undefined;

    let nextStatus: TaskStatus | null = null;

    if (overData?.type === "column" && overData.status) {
      nextStatus = overData.status;
    } else if (overData?.type === "task" && overData.task) {
      nextStatus = overData.task.status;
    } else if (BOARD_COLUMNS.some((column) => column.id === over.id)) {
      nextStatus = over.id as TaskStatus;
    }

    if (!nextStatus) return;

    const current = tasks.find((task) => task.id === taskId);
    if (!current || current.status === nextStatus) return;

    try {
      await moveTask(taskId, nextStatus);
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "Failed to update task status.",
      );
    }
  }

  return (
    <section className="space-y-4">
      <BoardToolbar
        taskCount={filteredTasks.length}
        filters={filters}
        members={members}
        labels={labels}
        onFiltersChange={setFilters}
      />

      {moveError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {moveError}
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={(event) => {
          void handleDragEnd(event);
        }}
      >
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-4 px-1">
            {BOARD_COLUMNS.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={tasksByStatus[column.id]}
                onOpenTask={onOpenTask}
                onCreateInColumn={onCreateTask}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
