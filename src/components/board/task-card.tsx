"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { Check, Circle } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

type TaskCardContentProps = {
  task: Task;
  className?: string;
  elevated?: boolean;
};

function getDueDateState(dueDate: string | null, status: Task["status"]) {
  if (!dueDate) return null;

  const due = startOfDay(parseISO(dueDate));
  const today = startOfDay(new Date());
  const isOverdue = status !== "done" && isBefore(due, today);
  const isDueSoon =
    status !== "done" &&
    !isOverdue &&
    due.getTime() - today.getTime() <= 1000 * 60 * 60 * 24 * 2;

  return {
    label: format(due, "MMM d"),
    isOverdue,
    isDueSoon,
  };
}

export function TaskCardContent({
  task,
  className,
  elevated = false,
}: TaskCardContentProps) {
  const due = getDueDateState(task.dueDate, task.status);
  const done = task.status === "done";

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-3",
        elevated
          ? "shadow-[0_16px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/5"
          : "shadow-sm",
        className,
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
            done
              ? "border-success bg-success text-success-foreground"
              : "border-muted-foreground/50 text-transparent",
          )}
          aria-hidden
        >
          {done ? <Check className="size-2.5" strokeWidth={3} /> : <Circle className="size-2.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-medium leading-snug text-foreground",
              done && "text-muted-foreground line-through decoration-muted-foreground/60",
            )}
          >
            {task.title}
          </h3>

          {task.labels.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.labels.map((label) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="border-transparent text-[10px]"
                  style={{
                    backgroundColor: `${label.color}22`,
                    color: label.color,
                  }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {task.assignee ? (
                <Avatar className="size-5">
                  <AvatarFallback
                    className="text-[9px] font-semibold text-white"
                    style={{ backgroundColor: task.assignee.color }}
                    title={task.assignee.name}
                  >
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
              ) : null}
              {due ? (
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    due.isOverdue && "text-destructive",
                    due.isDueSoon && !due.isOverdue && "text-warning",
                    !due.isOverdue && !due.isDueSoon && "text-muted-foreground",
                  )}
                >
                  {due.label}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type TaskCardProps = {
  task: Task;
  onOpen?: (task: Task) => void;
};

export function TaskCard({ task, onOpen }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: {
        type: "task",
        task,
        status: task.status,
      },
    });

  const style = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} className="relative touch-none">
      {isDragging ? (
        <div
          className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5"
          style={{ minHeight: 72 }}
          aria-hidden
        />
      ) : (
        <button
          type="button"
          className={cn(
            "block w-full cursor-grab text-left active:cursor-grabbing",
            "rounded-xl outline-none transition-shadow duration-150",
            "hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring",
          )}
          onClick={() => onOpen?.(task)}
          {...listeners}
          {...attributes}
        >
          <TaskCardContent task={task} />
        </button>
      )}
    </div>
  );
}

export function TaskCardOverlay({ task }: { task: Task }) {
  return (
    <div className="w-[260px] cursor-grabbing">
      <div className="origin-center scale-[1.02] rotate-[1deg]">
        <TaskCardContent task={task} elevated />
      </div>
    </div>
  );
}
