import { z } from "zod";
import { TASK_STATUSES, TASK_PRIORITIES } from "@task-dashboard/shared-types";

const isoDateString = z
  .string()
  .refine((val) => !Number.isNaN(Date.parse(val)), { message: "must be a valid ISO date string" });

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  description: z.string().nullable().optional(),
  status: z.enum(TASK_STATUSES).optional().default("PENDING"),
  priority: z.enum(TASK_PRIORITIES).optional().default("MEDIUM"),
  assignedTo: z.string().uuid("assignedTo must be a valid uuid").nullable().optional(),
  dueDate: isoDateString.nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assignedTo: z.string().optional(),
  search: z.string().optional(),
  sortBy: z
    .enum(["title", "status", "priority", "dueDate", "createdAt", "updatedAt"])
    .optional()
    .default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type CreateTaskSchemaInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchemaInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuerySchemaInput = z.infer<typeof listTasksQuerySchema>;
