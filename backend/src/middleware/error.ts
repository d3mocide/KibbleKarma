import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../logger";

// A typed error that routes/services can throw to produce a clean HTTP response.
export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: { message: "Not found" } });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const correlationId = (req as Request & { correlationId?: string }).correlationId;

  if (err instanceof ZodError) {
    logger.warn("Validation error", { correlationId, path: req.path, issues: err.issues });
    return res.status(400).json({
      error: { message: "Validation failed", details: err.flatten() },
    });
  }

  if (err instanceof HttpError) {
    if (err.status >= 500) {
      logger.error(err.message, { correlationId, path: req.path, status: err.status });
    } else {
      logger.warn(err.message, { correlationId, path: req.path, status: err.status });
    }
    return res.status(err.status).json({
      error: { message: err.message, ...(err.details ? { details: err.details } : {}) },
    });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  logger.error("Unhandled error", { correlationId, path: req.path, message });
  return res.status(500).json({ error: { message: "Internal server error", correlationId } });
}
