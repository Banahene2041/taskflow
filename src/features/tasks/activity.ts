import { formatDistanceToNow } from "date-fns";

import { STATUS_LABELS } from "@/features/tasks/constants";
import type { TaskActivity, TaskStatus } from "@/features/tasks/types";

export function formatActivityMessage(item: TaskActivity) {
  if (item.action === "created") {
    return "Task created";
  }

  if (item.action === "status_changed") {
    const from = STATUS_LABELS[(item.meta.from as TaskStatus) ?? "todo"] ?? "Unknown";
    const to = STATUS_LABELS[(item.meta.to as TaskStatus) ?? "todo"] ?? "Unknown";
    return `Moved from ${from} → ${to}`;
  }

  if (item.action === "assignee_changed") {
    return "Assignee updated";
  }

  if (item.action === "updated") {
    return "Task details updated";
  }

  return item.action.replaceAll("_", " ");
}

export function formatActivityTime(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}
