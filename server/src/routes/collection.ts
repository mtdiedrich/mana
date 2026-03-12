import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import {
  getCollection,
  addToCollection,
  updateCollectionCard,
  removeFromCollection,
} from "../services/collection.js";

export function collectionRouter(prisma: PrismaClient): Router {
  const router = Router();
  router.use(authMiddleware(prisma));

  // Get user's collection
  router.get("/", async (_req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const collection = await getCollection(db, userId);
    res.json(collection);
  });

  // Add card to collection
  router.post("/", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const { scryfallId, name, qty, cardData } = req.body;
    if (!scryfallId || !name) {
      res.status(400).json({ error: "scryfallId and name are required" });
      return;
    }
    const card = await addToCollection(db, userId, {
      scryfallId,
      name,
      qty: qty ?? 1,
      cardData: cardData ?? {},
    });
    res.status(201).json(card);
  });

  // Update card in collection
  router.put("/:id", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const { qty } = req.body;
    if (typeof qty !== "number" || qty < 1) {
      res.status(400).json({ error: "qty must be a positive number" });
      return;
    }
    const card = await updateCollectionCard(db, userId, req.params.id as string, { qty });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json(card);
  });

  // Remove card from collection
  router.delete("/:id", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const removed = await removeFromCollection(db, userId, req.params.id as string);
    if (!removed) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}
