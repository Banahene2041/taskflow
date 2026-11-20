"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { SortableTaskCard } from "@/components/board/task-card";
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
  isDropTarget?: boolean;
  className?: string;
};

export function BoardColumn({
  column,
  tasks,
  onOpenTask,
  onCreateInColumn,
  isDropTarget = false,
  className,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      status: column.id,
    },
  });

  const highlighted = isOver || isDropTarget;

  return (
    <section
      className={cn(
        "flex w-[288px] shrink-0 flex-col rounded-2xl border bg-muted/35 transition-[border-color,background-color,box-shadow] duration-200 dark:bg-surface/35",
        highlighted
          ? "border-primary/40 bg-primary/[0.06] shadow-[inset_0_0_0_1px_rgba(99,91,255,0.12)]"
          : "border-border",
        className,
      )}
      aria-labelledby={`column-${column.id}-title`}
    >
      <header className="flex items-start justify-between gap-2 px-3.5 pb-2 pt-3.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              id={`column-${column.id}-title`}
              className="text-sm font-semibold tracking-tight"
            >
              {column.title}
            </h2>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-card px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground shadow-sm">
              {tasks.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {column.description}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground"
          aria-label={`Add task to ${column.title}`}
          onClick={() => onCreateInColumn(column.id)}
        >
          <Plus className="size-4" />
        </Button>
      </header>

      <div
        ref={setNodeRef}
        className="flex min-h-[22rem] flex-1 flex-col gap-2.5 px-2.5 pb-3"
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onOpen={onOpenTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <div
            className={cn(
              "flex min-h-28 flex-1 flex-col items-center justify-center rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
              highlighted
                ? "border-primary/40 bg-primary/5"
                : "border-border/80 bg-card/40",
            )}
          >
            <p className="text-sm font-medium text-foreground">Drop here</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Or create a new task in this column
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
