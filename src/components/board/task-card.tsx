"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "@/features/tasks/constants";
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
  const priorityStyle = PRIORITY_STYLES[task.priority];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-3.5",
        elevated
          ? "shadow-[0_16px_40px_rgba(23,25,35,0.2)] ring-1 ring-black/5 dark:shadow-[0_20px_48px_rgba(0,0,0,0.5)] dark:ring-white/10"
          : "shadow-sm",
        className,
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {task.title}
        </h3>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
            priorityStyle.badge,
          )}
        >
          <span className={cn("size-1.5 rounded-full", priorityStyle.dot)} />
          {PRIORITY_LABELS[task.priority]}
        </span>
      </div>

      {task.description ? (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      ) : null}

      {task.labels.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="border-transparent text-[11px]"
              style={{
                backgroundColor: `${label.color}18`,
                color: label.color,
              }}
            >
              {label.name}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        {due ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              due.isOverdue && "bg-destructive/10 text-destructive",
              due.isDueSoon &&
                !due.isOverdue &&
                "bg-warning/15 text-warning-foreground",
              !due.isOverdue &&
                !due.isDueSoon &&
                "bg-muted text-muted-foreground",
            )}
          >
            <CalendarDays className="size-3" aria-hidden />
            {due.isOverdue ? `Overdue · ${due.label}` : due.label}
          </span>
        ) : (
          <span />
        )}

        {task.assignee ? (
          <Avatar className="size-6 ring-2 ring-card">
            <AvatarFallback
              className="text-[10px] font-semibold text-white"
              style={{ backgroundColor: task.assignee.color }}
              title={task.assignee.name}
            >
              {task.assignee.initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar className="size-6 ring-2 ring-card">
            <AvatarFallback className="text-[10px]">—</AvatarFallback>
          </Avatar>
        )}
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

  // Keep the source in place; the DragOverlay follows the pointer.
  const style = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style} className="relative touch-none">
      {isDragging ? (
        <div
          className="rounded-xl border-2 border-dashed border-primary/35 bg-primary/[0.06]"
          style={{ minHeight: 96 }}
          aria-hidden
        />
      ) : (
        <button
          type="button"
          className={cn(
            "block w-full cursor-grab text-left active:cursor-grabbing",
            "rounded-xl outline-none transition-shadow duration-150",
            "hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
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
    <div className="w-[264px] cursor-grabbing">
      <div className="origin-center scale-[1.03] rotate-[1.25deg]">
        <TaskCardContent task={task} elevated />
      </div>
    </div>
  );
}
