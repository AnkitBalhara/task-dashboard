import { prisma } from "../../config/db";
import { ApiError } from "../../utils/ApiError";
import type { CreateCommentSchemaInput } from "./comments.schema";

async function assertTaskExists(taskId: string): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw ApiError.notFound("Task not found");
  }
}

export async function listByTask(taskId: string) {
  await assertTaskExists(taskId);

  return prisma.comment.findMany({
    where: { taskId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function addComment(taskId: string, input: CreateCommentSchemaInput) {
  await assertTaskExists(taskId);

  const user = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return prisma.comment.create({
    data: {
      taskId,
      userId: input.userId,
      comment: input.comment,
    },
    include: { user: true },
  });
}
