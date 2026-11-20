"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";

import { BoardColumn } from "@/components/board/board-column";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { TaskCardOverlay } from "@/components/board/task-card";
import { BOARD_COLUMNS } from "@/features/tasks/constants";
import { useBoardStore } from "@/features/tasks/board-store";
import { useFilteredTasks, useTasksByStatus } from "@/features/tasks/hooks";
import { resolveDropIndex } from "@/features/tasks/reorder";
import type { Task, TaskStatus } from "@/features/tasks/types";

type BoardProps = {
  onOpenTask: (task: Task) => void;
  onCreateTask: (status?: TaskStatus) => void;
};

const dropAnimation: DropAnimation = {
  duration: 200,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

function resolveStatus(
  overId: string,
  overData: { type?: string; status?: TaskStatus; task?: Task } | undefined,
  tasks: Task[],
): TaskStatus | null {
  if (overData?.type === "column" && overData.status) {
    return overData.status;
  }

  if (overData?.type === "task" && overData.task) {
    return overData.task.status;
  }

  if (BOARD_COLUMNS.some((column) => column.id === overId)) {
    return overId as TaskStatus;
  }

  const overTask = tasks.find((task) => task.id === overId);
  return overTask?.status ?? null;
}

export function Board({ onOpenTask, onCreateTask }: BoardProps) {
  const { tasks, members, labels, filters, setFilters, reorderTask } =
    useBoardStore();
  const filteredTasks = useFilteredTasks(tasks, filters);
  const tasksByStatus = useTasksByStatus(filteredTasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const taskLookup = useMemo(() => {
    const map = new Map<string, Task>();
    for (const task of tasks) map.set(task.id, task);
    return map;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = taskLookup.get(String(event.active.id)) ?? null;
    setActiveTask(task);
    setMoveError(null);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    const current = activeTask;
    setActiveTask(null);

    if (!over || !current) return;

    const overId = String(over.id);
    if (overId === current.id) return;

    const overData = over.data.current as
      | { type?: string; status?: TaskStatus; task?: Task }
      | undefined;

    const nextStatus = resolveStatus(overId, overData, tasks);
    if (!nextStatus) return;

    const destination = tasksByStatus[nextStatus];
    const toIndex = resolveDropIndex(
      overId,
      overData?.type,
      destination,
      current.id,
    );

    if (current.status === nextStatus) {
      const fromIndex = destination.findIndex((task) => task.id === current.id);
      if (fromIndex === toIndex) return;
    }

    try {
      await reorderTask(current.id, nextStatus, toIndex);
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "Failed to reorder task.",
      );
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  return (
    <section className="space-y-4">
      <BoardToolbar
        taskCount={filteredTasks.length}
        filters={filters}
        members={members}
        labels={labels}
        onFiltersChange={setFilters}
        onCreateTask={() => onCreateTask()}
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
        onDragCancel={handleDragCancel}
      >
        <div className="-mx-1 overflow-x-auto pb-3">
          <div className="flex min-w-max gap-3 px-1">
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

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
