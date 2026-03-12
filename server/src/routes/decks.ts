import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import {
  createDeck,
  getUserDecks,
  getDeck,
  updateDeck,
  deleteDeck,
  addCardToDeck,
  updateDeckCard,
  removeCardFromDeck,
  importDecklist,
} from "../services/deck.js";

async function fetchScryfallCard(name: string): Promise<Record<string, unknown>> {
  const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(name)}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to resolve card: ${name}`);
  return (await resp.json()) as Record<string, unknown>;
}

export function deckRouter(prisma: PrismaClient): Router {
  const router = Router();
  router.use(authMiddleware(prisma));

  // List user's decks
  router.get("/", async (_req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const decks = await getUserDecks(db, userId);
    res.json(decks);
  });

  // Create a deck
  router.post("/", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const { name, format } = req.body;
    if (!name) {
      res.status(400).json({ error: "Deck name is required" });
      return;
    }
    const deck = await createDeck(db, userId, { name, format: format ?? "casual" });
    res.status(201).json(deck);
  });

  // Get a single deck
  router.get("/:id", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const deck = await getDeck(db, userId, req.params.id as string);
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    res.json(deck);
  });

  // Update a deck
  router.put("/:id", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const { name, format } = req.body;
    const deck = await updateDeck(db, userId, req.params.id as string, { name, format });
    if (!deck) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    res.json(deck);
  });

  // Delete a deck
  router.delete("/:id", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const deleted = await deleteDeck(db, userId, req.params.id as string);
    if (!deleted) {
      res.status(404).json({ error: "Deck not found" });
      return;
    }
    res.status(204).send();
  });

  // Add card to deck
  router.post("/:id/cards", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    try {
      const { scryfallId, name, qty, cardData } = req.body;
      if (!scryfallId || !name) {
        res.status(400).json({ error: "scryfallId and name are required" });
        return;
      }
      const card = await addCardToDeck(db, userId, req.params.id as string, {
        scryfallId,
        name,
        qty: qty ?? 1,
        cardData: cardData ?? {},
      });
      res.status(201).json(card);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add card";
      res.status(400).json({ error: message });
    }
  });

  // Update card in deck
  router.put("/:id/cards/:cardId", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const { qty } = req.body;
    if (typeof qty !== "number" || qty < 1) {
      res.status(400).json({ error: "qty must be a positive number" });
      return;
    }
    const card = await updateDeckCard(db, userId, req.params.id as string, req.params.cardId as string, { qty });
    if (!card) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.json(card);
  });

  // Remove card from deck
  router.delete("/:id/cards/:cardId", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    const removed = await removeCardFromDeck(db, userId, req.params.id as string, req.params.cardId as string);
    if (!removed) {
      res.status(404).json({ error: "Card not found" });
      return;
    }
    res.status(204).send();
  });

  // Import decklist
  router.post("/:id/import", async (req: Request, res: Response) => {
    const { userId, prisma: db } = res.locals;
    try {
      const { text } = req.body;
      if (!text) {
        res.status(400).json({ error: "text is required" });
        return;
      }
      const cards = await importDecklist(db, userId, req.params.id as string, text, fetchScryfallCard);
      res.status(201).json(cards);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      res.status(400).json({ error: message });
    }
  });

  return router;
}
