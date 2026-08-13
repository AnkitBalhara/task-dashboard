import type { ApiSuccessResponse, PaginationMeta } from "@task-dashboard/shared-types";

export function success<T>(data: T): ApiSuccessResponse<T> {
  return { data };
}

export function successWithMeta<T>(data: T, meta: PaginationMeta): ApiSuccessResponse<T> {
  return { data, meta };
}

export function buildMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: limit > 0 ? Math.ceil(total / limit) : 0,
  };
}
