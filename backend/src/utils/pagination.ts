const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function getPagination(input: PaginationInput): PaginationResult {
  let page = Number.isFinite(input.page) && Number(input.page) > 0 ? Math.floor(Number(input.page)) : DEFAULT_PAGE;
  let limit = Number.isFinite(input.limit) && Number(input.limit) > 0 ? Math.floor(Number(input.limit)) : DEFAULT_LIMIT;

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

export default getPagination;
