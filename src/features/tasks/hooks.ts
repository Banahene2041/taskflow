"use client";

import { useMemo } from "react";

import type { Task, TaskStats, TaskStatus } from "./types";

export function useTasksByStatus(tasks: Task[]) {
  return useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };

    for (const task of tasks) {
      grouped[task.status].push(task);
    }

    return grouped;
  }, [tasks]);
}

export function useTaskStats(tasks: Task[]): TaskStats {
  return useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return {
      total: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      inReview: tasks.filter((task) => task.status === "in_review").length,
      done: tasks.filter((task) => task.status === "done").length,
      overdue: tasks.filter((task) => {
        if (!task.dueDate || task.status === "done") return false;
        return new Date(task.dueDate) < now;
      }).length,
    };
  }, [tasks]);
}
