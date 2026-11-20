"use client";

import { useMemo } from "react";

import type {
  BoardFilters,
  Task,
  TaskStats,
  TaskStatus,
} from "@/features/tasks/types";

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

    for (const status of Object.keys(grouped) as TaskStatus[]) {
      grouped[status].sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position;
        return a.createdAt.localeCompare(b.createdAt);
      });
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

export function useFilteredTasks(tasks: Task[], filters: BoardFilters) {
  return useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (query && !task.title.toLowerCase().includes(query)) {
        return false;
      }

      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      if (
        filters.assigneeId !== "all" &&
        task.assigneeId !== filters.assigneeId
      ) {
        return false;
      }

      if (
        filters.labelId !== "all" &&
        !task.labels.some((label) => label.id === filters.labelId)
      ) {
        return false;
      }

      return true;
    });
  }, [tasks, filters]);
}
