"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { TaskCard } from "@/components/board/task-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", status: column.id },
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[28rem] w-[280px] shrink-0 flex-col rounded-2xl border border-border bg-muted/40 transition-colors dark:bg-surface/40",
        isOver && "border-primary/40 bg-primary/5",
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
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-card px-1.5 text-[11px] font-medium text-muted-foreground shadow-sm">
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

      <ScrollArea className="flex-1 px-2.5 pb-3">
        <div className="flex flex-col gap-2.5 pr-1.5">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
            ))
          ) : (
            <div className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-foreground">No tasks yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag tasks here or create a new one.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </section>
  );
}
