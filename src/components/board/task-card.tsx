"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { CalendarDays, GripVertical } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_LABELS, PRIORITY_STYLES } from "@/features/tasks/constants";
import type { Task } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: Task;
  onOpen?: (task: Task) => void;
  className?: string;
  isOverlay?: boolean;
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

export function TaskCard({
  task,
  onOpen,
  className,
  isOverlay = false,
}: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { type: "task", task },
      disabled: isOverlay,
    });

  const due = getDueDateState(task.dueDate, task.status);
  const priorityStyle = PRIORITY_STYLES[task.priority];

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;

  return (
    <article
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all",
        !isOverlay && "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md",
        isDragging && "opacity-40",
        isOverlay && "shadow-lg ring-2 ring-primary/30",
        className,
      )}
    >
      <div className="mb-2 flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none rounded-md p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          aria-label={`Drag ${task.title}`}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onOpen?.(task)}
        >
          <div className="flex items-start justify-between gap-2">
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
        </button>
      </div>

      <button
        type="button"
        className="w-full text-left"
        onClick={() => onOpen?.(task)}
      >
        {task.description ? (
          <p className="mb-3 line-clamp-2 pl-6 text-xs leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        {task.labels.length > 0 ? (
          <div className="mb-3 flex flex-wrap gap-1.5 pl-6">
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

        <div className="flex items-center justify-between gap-2 pl-6">
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
      </button>
    </article>
  );
}
