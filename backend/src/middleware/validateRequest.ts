import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

export interface RequestSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Validates (and coerces) req.body/query/params against the given zod
 * schemas, replacing them with the parsed values so downstream handlers
 * can rely on defaults/coercions having been applied. On failure, calls
 * next() with a 400 ApiError whose `details` is the flattened zod issues.
 */
export function validateRequest(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query);
        Object.assign(req.query, parsed);
      }
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params);
        Object.assign(req.params, parsed);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ApiError(400, "Validation failed", err.flatten()));
        return;
      }
      next(err);
    }
  };
}

export default validateRequest;
