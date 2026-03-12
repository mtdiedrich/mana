import { describe, it, expect } from "vitest";
import { addToCollection, removeFromCollection } from "./collection";
import type { DeckCard, ScryfallCard } from "./types";

const makeCard = (overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
  id: "card-1",
  name: "Sol Ring",
  prices: { usd: "3.00" },
  ...overrides,
});

describe("addToCollection", () => {
  it("adds a new card with qty 1", () => {
    const result = addToCollection([], makeCard());
    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(1);
    expect(result[0].name).toBe("Sol Ring");
  });

  it("increments qty for existing card", () => {
    const existing: DeckCard[] = [{ ...makeCard(), qty: 2 }];
    const result = addToCollection(existing, makeCard());
    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(3);
  });

  it("does not mutate the original array", () => {
    const original: DeckCard[] = [];
    addToCollection(original, makeCard());
    expect(original).toHaveLength(0);
  });
});

describe("removeFromCollection", () => {
  it("decrements qty when above 1", () => {
    const coll: DeckCard[] = [{ ...makeCard(), qty: 3 }];
    const result = removeFromCollection(coll, "card-1");
    expect(result).toHaveLength(1);
    expect(result[0].qty).toBe(2);
  });

  it("removes card entirely when qty is 1", () => {
    const coll: DeckCard[] = [{ ...makeCard(), qty: 1 }];
    const result = removeFromCollection(coll, "card-1");
    expect(result).toHaveLength(0);
  });

  it("returns unchanged collection if card not found", () => {
    const coll: DeckCard[] = [{ ...makeCard(), qty: 1 }];
    const result = removeFromCollection(coll, "nonexistent");
    expect(result).toHaveLength(1);
  });
});
