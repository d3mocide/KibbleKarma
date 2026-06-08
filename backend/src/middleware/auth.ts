import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "./error";

export interface AuthPayload {
  userId: string;
  email: string;
}

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
      correlationId?: string;
    }
  }
}

export function signToken(payload: AuthPayload): string {
  const options: jwt.SignOptions = { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, config.jwt.secret, options);
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing or invalid Authorization header");
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthPayload;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
