import type { BoardColumn, TaskPriority, TaskStatus } from "./types";

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    id: "todo",
    title: "To Do",
    description: "Queued and ready to start",
  },
  {
    id: "in_progress",
    title: "In Progress",
    description: "Actively being worked on",
  },
  {
    id: "in_review",
    title: "In Review",
    description: "Waiting on feedback",
  },
  {
    id: "done",
    title: "Done",
    description: "Completed and shipped",
  },
];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
};

export const PRIORITY_STYLES: Record<
  TaskPriority,
  { badge: string; dot: string }
> = {
  low: {
    badge:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  normal: {
    badge:
      "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  high: {
    badge:
      "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    dot: "bg-rose-500",
  },
};
