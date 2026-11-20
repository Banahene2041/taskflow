import type {
  Task,
  TaskActivity,
  TaskAssignee,
  TaskComment,
  TaskLabel,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types";
import type { Database } from "@/types/database";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type MemberRow = Database["public"]["Tables"]["team_members"]["Row"];
type LabelRow = Database["public"]["Tables"]["labels"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
type ActivityRow = Database["public"]["Tables"]["task_activity"]["Row"];

export function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function mapMember(row: MemberRow): TaskAssignee {
  return {
    id: row.id,
    name: row.name,
    initials: initialsFromName(row.name),
    color: row.color,
    avatarUrl: row.avatar_url,
  };
}

export function mapLabel(row: LabelRow): TaskLabel {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

export function mapTask(
  row: TaskRow,
  assignee: TaskAssignee | null = null,
  labels: TaskLabel[] = [],
): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    dueDate: row.due_date,
    userId: row.user_id,
    assigneeId: row.assignee_id,
    assignee,
    labels,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapComment(row: CommentRow): TaskComment {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function mapActivity(row: ActivityRow): TaskActivity {
  const meta =
    row.meta && typeof row.meta === "object" && !Array.isArray(row.meta)
      ? (row.meta as Record<string, unknown>)
      : {};

  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    action: row.action,
    meta,
    createdAt: row.created_at,
  };
}
