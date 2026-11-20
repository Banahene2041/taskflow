"use client";

import { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { BoardColumn } from "@/components/board/board-column";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { TaskCardOverlay } from "@/components/board/task-card";
import { BOARD_COLUMNS } from "@/features/tasks/constants";
import { useBoardStore } from "@/features/tasks/board-store";
import { useFilteredTasks } from "@/features/tasks/hooks";
import type { Task, TaskStatus } from "@/features/tasks/types";

type BoardProps = {
  onOpenTask: (task: Task) => void;
  onCreateTask: (status?: TaskStatus) => void;
};

type ColumnsState = Record<TaskStatus, Task[]>;

function emptyColumns(): ColumnsState {
  return {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  };
}

function groupTasks(tasks: Task[]): ColumnsState {
  const grouped = emptyColumns();
  for (const task of tasks) {
    grouped[task.status].push(task);
  }
  return grouped;
}

function findContainer(
  columns: ColumnsState,
  id: UniqueIdentifier,
): TaskStatus | null {
  if (id in columns) return id as TaskStatus;

  for (const status of Object.keys(columns) as TaskStatus[]) {
    if (columns[status].some((task) => task.id === id)) {
      return status;
    }
  }

  return null;
}

const dropAnimation: DropAnimation = {
  duration: 220,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export function Board({ onOpenTask, onCreateTask }: BoardProps) {
  const { tasks, members, labels, filters, setFilters, moveTask } =
    useBoardStore();
  const filteredTasks = useFilteredTasks(tasks, filters);
  const syncedColumns = useMemo(
    () => groupTasks(filteredTasks),
    [filteredTasks],
  );

  // While dragging we mutate a local snapshot so cards slide live like Asana/Notion.
  const [dragColumns, setDragColumns] = useState<ColumnsState | null>(null);
  const columns = dragColumns ?? syncedColumns;

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overContainer, setOverContainer] = useState<TaskStatus | null>(null);
  const [moveError, setMoveError] = useState<string | null>(null);
  const dragOriginStatus = useRef<TaskStatus | null>(null);
  const latestColumnsRef = useRef<ColumnsState>(syncedColumns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const taskLookup = useMemo(() => {
    const map = new Map<string, Task>();
    for (const task of tasks) map.set(task.id, task);
    return map;
  }, [tasks]);

  function handleDragStart(event: DragStartEvent) {
    const taskId = String(event.active.id);
    const task = taskLookup.get(taskId) ?? null;
    const snapshot = groupTasks(filteredTasks);

    latestColumnsRef.current = snapshot;
    setDragColumns(snapshot);
    setActiveTask(task);
    setMoveError(null);
    dragOriginStatus.current = task?.status ?? null;
    setOverContainer(findContainer(snapshot, event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const current = latestColumnsRef.current;

    const activeContainer = findContainer(current, activeId);
    const overContainerId = findContainer(current, overId);

    if (!activeContainer || !overContainerId) return;

    setOverContainer(overContainerId);

    if (activeContainer === overContainerId) return;

    const activeItems = current[activeContainer];
    const overItems = current[overContainerId];
    const activeIndex = activeItems.findIndex((task) => task.id === activeId);
    if (activeIndex === -1) return;

    const moving = {
      ...activeItems[activeIndex],
      status: overContainerId,
    };

    let newIndex: number;
    if (overId in current) {
      newIndex = overItems.length + 1;
    } else {
      const overIndex = overItems.findIndex((task) => task.id === overId);
      const isBelowOverItem =
        Boolean(active.rect.current.translated) &&
        active.rect.current.translated!.top > over.rect.top + over.rect.height;

      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    }

    const next = {
      ...current,
      [activeContainer]: activeItems.filter((task) => task.id !== activeId),
      [overContainerId]: [
        ...overItems.slice(0, newIndex),
        moving,
        ...overItems.slice(newIndex),
      ],
    };

    latestColumnsRef.current = next;
    setDragColumns(next);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const originStatus = dragOriginStatus.current;
    const currentColumns = latestColumnsRef.current;

    setActiveTask(null);
    setOverContainer(null);
    dragOriginStatus.current = null;

    if (!over) {
      setDragColumns(null);
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeContainer = findContainer(currentColumns, activeId);
    const overContainerId = findContainer(currentColumns, overId);

    if (!activeContainer || !overContainerId) {
      setDragColumns(null);
      return;
    }

    // Smooth same-column reordering while dragging; order is session-local.
    if (activeContainer === overContainerId) {
      const activeIndex = currentColumns[activeContainer].findIndex(
        (task) => task.id === activeId,
      );
      const overIndex = currentColumns[overContainerId].findIndex(
        (task) => task.id === overId,
      );

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        setDragColumns({
          ...currentColumns,
          [overContainerId]: arrayMove(
            currentColumns[overContainerId],
            activeIndex,
            overIndex,
          ),
        });
      } else {
        setDragColumns(null);
      }
    }

    const nextStatus = overContainerId;
    if (originStatus && originStatus !== nextStatus) {
      try {
        await moveTask(activeId, nextStatus);
      } catch (err) {
        setMoveError(
          err instanceof Error ? err.message : "Failed to update task status.",
        );
      } finally {
        setDragColumns(null);
      }
      return;
    }

    // Same-column drop: release snapshot on next tick so drop animation finishes.
    window.setTimeout(() => setDragColumns(null), 180);
  }

  function handleDragCancel() {
    setActiveTask(null);
    setOverContainer(null);
    dragOriginStatus.current = null;
    setDragColumns(null);
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
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
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
                tasks={columns[column.id]}
                onOpenTask={onOpenTask}
                onCreateInColumn={onCreateTask}
                isDropTarget={overContainer === column.id}
              />
            ))}
          </div>
        </div>

        <DragOverlay adjustScale={false} dropAnimation={dropAnimation}>
          {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
