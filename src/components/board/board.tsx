"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
  type DropAnimation,
} from "@dnd-kit/core";

import { BoardColumn } from "@/components/board/board-column";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { TaskCardOverlay } from "@/components/board/task-card";
import { BOARD_COLUMNS } from "@/features/tasks/constants";
import { useBoardStore } from "@/features/tasks/board-store";
import { taskBoardCollisionDetection } from "@/features/tasks/dnd-collision";
import { useFilteredTasks, useTasksByStatus } from "@/features/tasks/hooks";
import { useTaskDnd } from "@/features/tasks/use-task-dnd";
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
  const { tasks, members, labels, filters, setFilters } = useBoardStore();
  const filteredTasks = useFilteredTasks(tasks, filters);
  const tasksByStatus = useTasksByStatus(filteredTasks);
  const {
    activeTask,
    moveError,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useTaskDnd(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

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
