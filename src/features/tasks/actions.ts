"use server";

import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "./schemas";

/**
 * Placeholder server actions. Real Supabase CRUD lands in a later phase.
 * Schemas are validated so the action surface stays ready for wiring.
 */
export async function createTaskAction(input: CreateTaskInput) {
  const parsed = createTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid task data",
    };
  }

  return {
    success: false as const,
    error: "Task persistence is not connected yet. Supabase CRUD comes next.",
  };
}

export async function updateTaskAction(input: UpdateTaskInput) {
  const parsed = updateTaskSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid task data",
    };
  }

  return {
    success: false as const,
    error: "Task persistence is not connected yet. Supabase CRUD comes next.",
  };
}
