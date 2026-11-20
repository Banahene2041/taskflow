export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "done",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "normal", "high"] as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export type TaskAssignee = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

/**
 * Application task shape. Field names align with the planned Supabase
 * `tasks` table (camelCase in app / snake_case in DB).
 */
export type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  userId: string;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  labels: TaskLabel[];
  createdAt: string;
  updatedAt: string;
};

export type BoardColumnId = TaskStatus;

export type BoardColumn = {
  id: BoardColumnId;
  title: string;
  description: string;
};

export type TaskStats = {
  total: number;
  todo: number;
  inProgress: number;
  inReview: number;
  done: number;
  overdue: number;
};
