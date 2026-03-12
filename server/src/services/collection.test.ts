import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import { createTestPrisma } from "../test-helpers.js";
import {
  getCollection,
  addToCollection,
  updateCollectionCard,
  removeFromCollection,
} from "./collection.js";
import { register } from "./auth.js";

const SAMPLE_CARD_DATA = {
  id: "scry-123",
  name: "Lightning Bolt",
  mana_cost: "{R}",
  cmc: 1,
  type_line: "Instant",
};

describe("Collection Service", () => {
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

  describe("getCollection", () => {
    it("returns empty collection for new user", async () => {
      const collection = await getCollection(prisma, userId);
      expect(collection).toEqual([]);
    });

    it("returns all cards in collection", async () => {
      await addToCollection(prisma, userId, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 4,
        cardData: SAMPLE_CARD_DATA,
      });

      const collection = await getCollection(prisma, userId);
      expect(collection).toHaveLength(1);
      expect(collection[0].name).toBe("Lightning Bolt");
      expect(collection[0].qty).toBe(4);
    });
  });

  describe("addToCollection", () => {
    it("adds a card to the collection", async () => {
      const card = await addToCollection(prisma, userId, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 2,
        cardData: SAMPLE_CARD_DATA,
      });

      expect(card.scryfallId).toBe("scry-123");
      expect(card.qty).toBe(2);
    });

    it("increments qty when adding duplicate card", async () => {
      await addToCollection(prisma, userId, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 2,
        cardData: SAMPLE_CARD_DATA,
      });
      const card = await addToCollection(prisma, userId, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 3,
        cardData: SAMPLE_CARD_DATA,
      });

      expect(card.qty).toBe(5);
    });
  });

  describe("updateCollectionCard", () => {
    it("updates card quantity", async () => {
      const card = await addToCollection(prisma, userId, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 2,
        cardData: SAMPLE_CARD_DATA,
      });

      const updated = await updateCollectionCard(prisma, userId, card.id, { qty: 10 });
      expect(updated!.qty).toBe(10);
    });

    it("returns null for non-existent card", async () => {
      const result = await updateCollectionCard(prisma, userId, "nonexistent", { qty: 1 });
      expect(result).toBeNull();
    });
  });

  describe("removeFromCollection", () => {
    it("removes a card from collection", async () => {
      const card = await addToCollection(prisma, userId, {
        scryfallId: "scry-123",
        name: "Lightning Bolt",
        qty: 4,
        cardData: SAMPLE_CARD_DATA,
      });

      const removed = await removeFromCollection(prisma, userId, card.id);
      expect(removed).toBe(true);

      const collection = await getCollection(prisma, userId);
      expect(collection).toHaveLength(0);
    });

    it("returns false for non-existent card", async () => {
      const result = await removeFromCollection(prisma, userId, "nonexistent");
      expect(result).toBe(false);
    });
  });
});
