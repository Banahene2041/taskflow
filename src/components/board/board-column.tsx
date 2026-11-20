"use client";

import { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { TaskCard } from "@/components/board/task-card";
import { Button } from "@/components/ui/button";
import type {
  BoardColumn as BoardColumnType,
  Task,
} from "@/features/tasks/types";
import { cn } from "@/lib/utils";

type BoardColumnProps = {
  column: BoardColumnType;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
  onCreateInColumn: (status: BoardColumnType["id"]) => void;
  className?: string;
};

export function BoardColumn({
  column,
  tasks,
  onOpenTask,
  onCreateInColumn,
  className,
}: BoardColumnProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      status: column.id,
    },
  });

  const highlighted = Boolean(active) && isOver;
  const itemIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  return (
    <section
      className={cn(
        "flex w-[280px] shrink-0 flex-col",
        className,
      )}
      aria-labelledby={`column-${column.id}-title`}
    >
      <header className="mb-3 flex items-center gap-2 px-1">
        <h2
          id={`column-${column.id}-title`}
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          {column.title}
        </h2>
        <span className="text-sm tabular-nums text-muted-foreground">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[18rem] flex-1 flex-col gap-2 rounded-xl p-1 transition-colors",
          highlighted && "bg-primary/5 ring-1 ring-primary/30",
        )}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <div
            className={cn(
              "flex min-h-24 flex-col items-center justify-center rounded-xl border border-dashed px-3 py-5 text-center",
              highlighted
                ? "border-primary/40 bg-primary/5"
                : "border-border/70",
            )}
          >
            <p className="text-sm text-muted-foreground">
              {highlighted ? "Release to drop" : "No tasks"}
            </p>
          </div>
        ) : null}

        <Button
          variant="ghost"
          size="sm"
          className="mt-1 justify-start text-muted-foreground hover:text-foreground"
          onClick={() => onCreateInColumn(column.id)}
        >
          <Plus className="size-4" />
          Add task
        </Button>
      </div>
    </section>
  );
}
