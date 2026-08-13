import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import type { ApiErrorResponse } from "@task-dashboard/shared-types";
import { ApiError } from "../utils/ApiError";

/**
 * Global Express error-handling middleware. Must be registered last
 * (after all routers and the notFound handler).
 *
 * Most validation errors never reach this point — validateRequest.ts
 * catches ZodErrors at the edge and rethrows them as ApiError(400). The
 * ZodError / Prisma branches below are defense-in-depth for errors thrown
 * directly from service code (e.g. a raw prisma call hitting a unique
 * constraint or a missing-record update that wasn't pre-checked).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    const body: ApiErrorResponse = {
      error: {
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      error: { message: "Validation failed", details: err.flatten() },
    };
    res.status(400).json(body);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const body: ApiErrorResponse = {
        error: { message: "A record with this value already exists", details: err.meta },
      };
      res.status(409).json(body);
      return;
    }

    if (err.code === "P2025") {
      const body: ApiErrorResponse = {
        error: { message: "Record not found", details: err.meta },
      };
      res.status(404).json(body);
      return;
    }
  }

  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);

  const message = err instanceof Error ? err.message : "Internal server error";
  const body: ApiErrorResponse = {
    error: { message: process.env.NODE_ENV === "production" ? "Internal server error" : message },
  };
  res.status(500).json(body);
}

export default errorHandler;
