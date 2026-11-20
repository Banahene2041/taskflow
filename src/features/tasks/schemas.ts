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
  dueDate: z.string().date("Enter a valid date").optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().nullable(),
  labelIds: z.array(z.string().uuid()).optional().default([]),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid("Invalid task id"),
});

export const updateTaskStatusSchema = z.object({
  id: z.string().uuid(),
  status: taskStatusSchema,
});

export const createMemberSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  color: z.string().min(4).max(32).default("#635BFF"),
});

export const createLabelSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(40),
  color: z.string().min(4).max(32).default("#635BFF"),
});

export const createCommentSchema = z.object({
  taskId: z.string().uuid(),
  body: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
