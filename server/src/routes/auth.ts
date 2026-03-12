import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { register, login, getUser } from "../services/auth.js";
import { authMiddleware, prismaMiddleware } from "../middleware/auth.js";

export function authRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.post("/register", prismaMiddleware(prisma), async (req: Request, res: Response) => {
    try {
      const { email, password, displayName } = req.body;
      const result = await register(res.locals.prisma, {
        email,
        password,
        displayName,
      });
      res.status(201).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      res.status(400).json({ error: message });
    }
  });

  router.post("/login", prismaMiddleware(prisma), async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await login(res.locals.prisma, { email, password });
      res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      res.status(401).json({ error: message });
    }
  });

  router.get("/me", authMiddleware(prisma), async (_req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const user = await getUser(db, userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  });

  return router;
}
