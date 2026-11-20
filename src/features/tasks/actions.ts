"use server";

import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "./schemas";

/**
 * Server-action surface kept for future SSR mutations.
 * The board currently uses the typed client API with RLS.
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
    success: true as const,
    data: parsed.data,
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
    success: true as const,
    data: parsed.data,
  };
}
