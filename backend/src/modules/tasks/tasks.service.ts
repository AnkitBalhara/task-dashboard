import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import { getPagination } from "../../utils/pagination";
import type { CreateTaskSchemaInput, ListTasksQuerySchemaInput, UpdateTaskSchemaInput } from "./tasks.schema";

/**
 * `isOverdue` is not a DB column — it's derived at read-time from
 * status + dueDate, so every task returned to callers goes through this.
 */
function withOverdueFlag<T extends { status: string; dueDate: Date | null }>(task: T) {
  const isOverdue = task.status !== "COMPLETED" && task.dueDate !== null && task.dueDate.getTime() < Date.now();
  return { ...task, isOverdue };
}

export async function listTasks(query: ListTasksQuerySchemaInput) {
  const { status, priority, assignedTo, search, sortBy, sortDir, page, limit } = query;
  const { skip, take, page: safePage, limit: safeLimit } = getPagination({ page, limit });

  const where: Prisma.TaskWhereInput = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(assignedTo ? { assignedTo } : {}),
    // SQLite's LIKE (which `contains` compiles to) is already case-insensitive
    // for ASCII, so no `mode` option is needed here (unlike Postgres).
    ...(search
      ? {
          OR: [{ title: { contains: search } }, { description: { contains: search } }],
        }
      : {}),
  };

  const orderBy = { [sortBy]: sortDir } as Prisma.TaskOrderByWithRelationInput;

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { assignee: true },
    }),
    prisma.task.count({ where }),
  ]);

  return {
    items: items.map(withOverdueFlag),
    total,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    throw ApiError.notFound("Task not found");
  }

  return withOverdueFlag(task);
}

export async function createTask(input: CreateTaskSchemaInput) {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      status: input.status,
      priority: input.priority,
      assignedTo: input.assignedTo ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
    },
    include: { assignee: true },
  });

  return withOverdueFlag(task);
}

export async function updateTask(id: string, input: UpdateTaskSchemaInput) {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Task not found");
  }

  const data: Prisma.TaskUncheckedUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  if (input.priority !== undefined) data.priority = input.priority;
  if (input.assignedTo !== undefined) data.assignedTo = input.assignedTo;
  if (input.dueDate !== undefined) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;

  const task = await prisma.task.update({
    where: { id },
    data,
    include: { assignee: true },
  });

  return withOverdueFlag(task);
}

export async function deleteTask(id: string): Promise<void> {
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing) {
    throw ApiError.notFound("Task not found");
  }

  // Comments cascade-delete via the schema's onDelete: Cascade.
  await prisma.task.delete({ where: { id } });
}
