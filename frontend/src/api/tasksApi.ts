import apiClient from "./client";
import type {
  Comment,
  CreateCommentInput,
  CreateTaskInput,
  PaginationMeta,
  Task,
  TaskListQuery,
  UpdateTaskInput,
} from "../types";

export interface TaskListResult {
  data: Task[];
  meta: PaginationMeta;
}

function buildQueryParams(query: TaskListQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.priority) params.priority = query.priority;
  if (query.assignedTo) params.assignedTo = query.assignedTo;
  if (query.search) params.search = query.search;
  if (query.sortBy) params.sortBy = query.sortBy;
  if (query.sortDir) params.sortDir = query.sortDir;
  if (query.page) params.page = query.page;
  if (query.limit) params.limit = query.limit;
  return params;
}

export const tasksApi = {
  async getAll(query: TaskListQuery = {}): Promise<TaskListResult> {
    const response = await apiClient.get<{ data: Task[]; meta: PaginationMeta }>("/tasks", {
      params: buildQueryParams(query),
    });
    return response.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await apiClient.get<{ data: Task }>(`/tasks/${id}`);
    return response.data.data;
  },

  async create(input: CreateTaskInput): Promise<Task> {
    const response = await apiClient.post<{ data: Task }>("/tasks", input);
    return response.data.data;
  },

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const response = await apiClient.put<{ data: Task }>(`/tasks/${id}`, input);
    return response.data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async listComments(taskId: string): Promise<Comment[]> {
    const response = await apiClient.get<{ data: Comment[] }>(`/tasks/${taskId}/comments`);
    return response.data.data;
  },

  async addComment(taskId: string, input: CreateCommentInput): Promise<Comment> {
    const response = await apiClient.post<{ data: Comment }>(`/tasks/${taskId}/comments`, input);
    return response.data.data;
  },
};

export default tasksApi;
