import type { DashboardStats } from "@task-dashboard/shared-types";
import { prisma } from "../../config/db";

export async function getStats(userId?: string): Promise<DashboardStats> {
  const now = new Date();

  const [statusGroups, overdue, assignedToMe] = await Promise.all([
    prisma.task.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.task.count({
      where: {
        status: { not: "COMPLETED" },
        dueDate: { lt: now },
      },
    }),
    userId ? prisma.task.count({ where: { assignedTo: userId } }) : Promise.resolve(0),
  ]);

  const countByStatus = statusGroups.reduce<Record<string, number>>((acc, group) => {
    acc[group.status] = group._count._all;
    return acc;
  }, {});

  const total = statusGroups.reduce((sum, group) => sum + group._count._all, 0);

  return {
    total,
    pending: countByStatus.PENDING ?? 0,
    inProgress: countByStatus.IN_PROGRESS ?? 0,
    completed: countByStatus.COMPLETED ?? 0,
    blocked: countByStatus.BLOCKED ?? 0,
    overdue,
    assignedToMe,
  };
}
