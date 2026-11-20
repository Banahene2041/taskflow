"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";

import { BoardColumn } from "@/components/board/board-column";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { TaskCardOverlay } from "@/components/board/task-card";
import { BOARD_COLUMNS } from "@/features/tasks/constants";
import { useBoardStore } from "@/features/tasks/board-store";
import { resolveDropTarget } from "@/features/tasks/dnd";
import { taskBoardCollisionDetection } from "@/features/tasks/dnd-collision";
import { useFilteredTasks, useTasksByStatus } from "@/features/tasks/hooks";
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

export function Board({ onOpenTask, onCreateTask }: BoardProps) {
  const {
    tasks,
    members,
    labels,
    filters,
    setFilters,
    reorderTaskLocal,
    restoreTasks,
    commitTaskOrder,
  } = useBoardStore();
  const filteredTasks = useFilteredTasks(tasks, filters);
  const tasksByStatus = useTasksByStatus(filteredTasks);
  const tasksByStatusAll = useTasksByStatus(tasks);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const dragSnapshotRef = useRef<Task[] | null>(null);

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
    dragSnapshotRef.current = tasks;
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;

    const activeTaskState = taskLookup.get(activeId);
    if (!activeTaskState) return;

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

    if (
      activeTaskState.status === target.status &&
      overData?.type !== "task"
    ) {
      return;
    }

    if (activeTaskState.status === target.status) {
      const fromIndex = tasksByStatusAll[target.status].findIndex(
        (task) => task.id === activeId,
      );
      if (fromIndex === target.index) return;
    }

    reorderTaskLocal(activeId, target.status, target.index);
  }

  async function handleDragEnd(_event: DragEndEvent) {
    setActiveTask(null);
    const snapshot = dragSnapshotRef.current;
    dragSnapshotRef.current = null;
    if (!snapshot) return;

    try {
      await commitTaskOrder(snapshot);
    } catch (err) {
      setMoveError(
        err instanceof Error ? err.message : "Failed to reorder task.",
      );
    }
  }

  function handleDragCancel() {
    setActiveTask(null);
    const snapshot = dragSnapshotRef.current;
    dragSnapshotRef.current = null;
    if (snapshot) restoreTasks(snapshot);
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
        collisionDetection={taskBoardCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
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
