import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestPrisma } from "../test-helpers.js";
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
} from "./deck.js";
import { register } from "./auth.js";

const SAMPLE_CARD_DATA = {
  id: "scry-123",
  name: "Lightning Bolt",
  mana_cost: "{R}",
  cmc: 1,
  type_line: "Instant",
};

describe("Deck Service", () => {
  let prisma: PrismaClient;
  let userId: string;

  beforeEach(async () => {
    const ctx = await createTestPrisma();
    prisma = ctx.prisma;
    const result = await register(prisma, {
      email: "test@example.com",
      password: "password123",
      displayName: "Test User",
    });
    userId = result.user.id;
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe("createDeck", () => {
    it("creates a deck for the user", async () => {
      const deck = await createDeck(prisma, userId, {
        name: "Burn",
        format: "modern",
      });

      expect(deck.name).toBe("Burn");
      expect(deck.format).toBe("modern");
      expect(deck.id).toBeDefined();
      expect(deck.cards).toEqual([]);
    });
  });

  describe("getUserDecks", () => {
    it("returns all decks for a user", async () => {
      await createDeck(prisma, userId, { name: "Deck A", format: "standard" });
      await createDeck(prisma, userId, { name: "Deck B", format: "commander" });

      const decks = await getUserDecks(prisma, userId);
      expect(decks).toHaveLength(2);
      expect(decks.map((d) => d.name).sort()).toEqual(["Deck A", "Deck B"]);
    });

    it("does not return other users' decks", async () => {
      const other = await register(prisma, {
        email: "other@example.com",
        password: "password123",
        displayName: "Other",
      });
      await createDeck(prisma, other.user.id, { name: "Not Mine", format: "casual" });
      await createDeck(prisma, userId, { name: "Mine", format: "casual" });

      const decks = await getUserDecks(prisma, userId);
      expect(decks).toHaveLength(1);
      expect(decks[0].name).toBe("Mine");
    });
  });

  describe("getDeck", () => {
    it("returns a deck with cards", async () => {
      const deck = await createDeck(prisma, userId, { name: "Burn", format: "modern" });
      await addCardToDeck(prisma, userId, deck.id, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 4,
        cardData: SAMPLE_CARD_DATA,
      });

      const fetched = await getDeck(prisma, userId, deck.id);
      expect(fetched).not.toBeNull();
      expect(fetched!.cards).toHaveLength(1);
      expect(fetched!.cards[0].name).toBe("Lightning Bolt");
      expect(fetched!.cards[0].qty).toBe(4);
    });

    it("returns null for non-existent deck", async () => {
      const result = await getDeck(prisma, userId, "nonexistent-id");
      expect(result).toBeNull();
    });

    it("returns null when accessing another user's deck", async () => {
      const deck = await createDeck(prisma, userId, { name: "Burn", format: "modern" });
      const other = await register(prisma, {
        email: "other@example.com",
        password: "password123",
        displayName: "Other",
      });

      const result = await getDeck(prisma, other.user.id, deck.id);
      expect(result).toBeNull();
    });
  });

  describe("updateDeck", () => {
    it("updates deck name and format", async () => {
      const deck = await createDeck(prisma, userId, { name: "Old", format: "casual" });
      const updated = await updateDeck(prisma, userId, deck.id, {
        name: "New",
        format: "modern",
      });

      expect(updated!.name).toBe("New");
      expect(updated!.format).toBe("modern");
    });

    it("returns null for non-existent deck", async () => {
      const result = await updateDeck(prisma, userId, "nonexistent", { name: "X" });
      expect(result).toBeNull();
    });
  });

  describe("deleteDeck", () => {
    it("deletes a deck and its cards", async () => {
      const deck = await createDeck(prisma, userId, { name: "Burn", format: "modern" });
      await addCardToDeck(prisma, userId, deck.id, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 4,
        cardData: SAMPLE_CARD_DATA,
      });

      const deleted = await deleteDeck(prisma, userId, deck.id);
      expect(deleted).toBe(true);

      const fetched = await getDeck(prisma, userId, deck.id);
      expect(fetched).toBeNull();
    });

    it("returns false for non-existent deck", async () => {
      const result = await deleteDeck(prisma, userId, "nonexistent");
      expect(result).toBe(false);
    });
  });

  describe("addCardToDeck", () => {
    it("adds a card to a deck", async () => {
      const deck = await createDeck(prisma, userId, { name: "Burn", format: "modern" });
      const card = await addCardToDeck(prisma, userId, deck.id, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 4,
        cardData: SAMPLE_CARD_DATA,
      });

      expect(card.scryfallId).toBe("scry-123");
      expect(card.qty).toBe(4);
    });

    it("increments qty when adding duplicate card", async () => {
      const deck = await createDeck(prisma, userId, { name: "Burn", format: "modern" });
      await addCardToDeck(prisma, userId, deck.id, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 2,
        cardData: SAMPLE_CARD_DATA,
      });
      const card = await addCardToDeck(prisma, userId, deck.id, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 2,
        cardData: SAMPLE_CARD_DATA,
      });

      expect(card.qty).toBe(4);
    });
  });

  describe("updateDeckCard", () => {
    it("updates card quantity", async () => {
      const deck = await createDeck(prisma, userId, { name: "Burn", format: "modern" });
      const card = await addCardToDeck(prisma, userId, deck.id, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 2,
        cardData: SAMPLE_CARD_DATA,
      });

      const updated = await updateDeckCard(prisma, userId, deck.id, card.id, { qty: 4 });
      expect(updated!.qty).toBe(4);
    });
  });

  describe("removeCardFromDeck", () => {
    it("removes a card from a deck", async () => {
      const deck = await createDeck(prisma, userId, { name: "Burn", format: "modern" });
      const card = await addCardToDeck(prisma, userId, deck.id, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 4,
        cardData: SAMPLE_CARD_DATA,
      });

      const removed = await removeCardFromDeck(prisma, userId, deck.id, card.id);
      expect(removed).toBe(true);

      const fetched = await getDeck(prisma, userId, deck.id);
      expect(fetched!.cards).toHaveLength(0);
    });
  });

  describe("importDecklist", () => {
    it("parses and imports a decklist", async () => {
      const deck = await createDeck(prisma, userId, { name: "Import Test", format: "casual" });
      const text = "4 Lightning Bolt\n2 Mountain\n";

      // importDecklist uses Scryfall API, so we pass a resolver function
      const cards = await importDecklist(prisma, userId, deck.id, text, async (name: string) => ({
        id: `scry-${name.replace(/\s/g, "-").toLowerCase()}`,
        name,
        mana_cost: "{R}",
        cmc: 1,
        type_line: "Instant",
      }));

      expect(cards).toHaveLength(2);
      const bolt = cards.find((c) => c.name === "Lightning Bolt");
      expect(bolt?.qty).toBe(4);
    });
  });
});
