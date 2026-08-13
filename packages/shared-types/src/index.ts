// Shared contract between backend and frontend. Keep these values in sync with
// backend/prisma/schema.prisma enums — they are the source of truth for valid strings.

export const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "BLOCKED"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const USER_ROLES = ["ADMIN", "MEMBER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string;
  user?: User;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string | null;
  assignee?: User | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  isOverdue: boolean;
  comments?: Comment[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    details?: unknown;
  };
}

export type SortDir = "asc" | "desc";

export interface TaskListQuery {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  search?: string;
  sortBy?: "title" | "status" | "priority" | "dueDate" | "createdAt" | "updatedAt";
  sortDir?: SortDir;
  page?: number;
  limit?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string | null;
  dueDate?: string | null;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface CreateUserInput {
  name: string;
  email: string;
  role?: UserRole;
}

export interface CreateCommentInput {
  userId: string;
  comment: string;
}

// Shape returned by GET /api/external/users — a thin projection of whatever
// the upstream public API (JSONPlaceholder) returns, kept minimal on purpose
// since this endpoint exists to demonstrate external API integration, not to
// model a full external user record.
export interface ExternalUser {
  id: number;
  name: string;
  email: string;
  username: string;
  company: string | null;
  website: string | null;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  blocked: number;
  overdue: number;
  assignedToMe: number;
}
