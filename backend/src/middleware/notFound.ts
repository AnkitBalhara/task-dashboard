import type { NextFunction, Request, Response } from "express";
import type { ApiErrorResponse } from "@task-dashboard/shared-types";

/**
 * Catches any request that didn't match a route. Must be mounted after
 * all routers and before the global error handler.
 */
export function notFound(_req: Request, res: Response, _next: NextFunction): void {
  const body: ApiErrorResponse = {
    error: { message: "Not found" },
  };
  res.status(404).json(body);
}

export default notFound;
