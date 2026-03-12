import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from "../services/auth.js";

export interface AuthenticatedLocals {
  userId: string;
  prisma: PrismaClient;
}

export function authMiddleware(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.locals.prisma = prisma;

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid authorization header" });
      return;
    }

    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      res.locals.userId = payload.userId;
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

export function prismaMiddleware(prisma: PrismaClient) {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.locals.prisma = prisma;
    next();
  };
}
