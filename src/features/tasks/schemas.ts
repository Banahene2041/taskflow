import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "./types";

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Title must be 120 characters or fewer"),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer")
    .optional()
    .or(z.literal("")),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("normal"),
  dueDate: z
    .string()
    .date("Enter a valid date")
    .optional()
    .or(z.literal("")),
  assigneeId: z.string().uuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid("Invalid task id"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
