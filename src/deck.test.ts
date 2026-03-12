import { describe, it, expect } from "vitest";
import {
  addCardToDeck,
  removeCardFromDeck,
  createDeck,
  deleteDeck,
  importDecklist,
  exportDecklist,
  sortDeckCards,
} from "./deck";
import type { Deck, DeckCard, ScryfallCard } from "./types";

const makeCard = (overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
  id: "card-1",
  name: "Lightning Bolt",
  mana_cost: "{R}",
  cmc: 1,
  type_line: "Instant",
  color_identity: ["R"],
  rarity: "common",
  prices: { usd: "1.50" },
  ...overrides,
});

const emptyDeck: Deck = { id: "deck-1", name: "Test Deck", cards: [], format: "commander" };

describe("addCardToDeck", () => {
  it("adds a new card with qty 1", () => {
    const result = addCardToDeck(emptyDeck, makeCard());
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].qty).toBe(1);
    expect(result.cards[0].name).toBe("Lightning Bolt");
  });

  it("increments qty for an existing card", () => {
    const deck: Deck = {
      ...emptyDeck,
      cards: [{ ...makeCard(), qty: 2 }],
    };
    const result = addCardToDeck(deck, makeCard());
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].qty).toBe(3);
  });

  it("does not mutate the original deck", () => {
    const result = addCardToDeck(emptyDeck, makeCard());
    expect(emptyDeck.cards).toHaveLength(0);
    expect(result.cards).toHaveLength(1);
  });
});

describe("removeCardFromDeck", () => {
  it("decrements qty when above 1", () => {
    const deck: Deck = {
      ...emptyDeck,
      cards: [{ ...makeCard(), qty: 3 }],
    };
    const result = removeCardFromDeck(deck, "card-1");
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].qty).toBe(2);
  });

  it("removes card entirely when qty is 1", () => {
    const deck: Deck = {
      ...emptyDeck,
      cards: [{ ...makeCard(), qty: 1 }],
    };
    const result = removeCardFromDeck(deck, "card-1");
    expect(result.cards).toHaveLength(0);
  });

  it("returns unchanged deck if card not found", () => {
    const deck: Deck = {
      ...emptyDeck,
      cards: [{ ...makeCard(), qty: 1 }],
    };
    const result = removeCardFromDeck(deck, "nonexistent");
    expect(result.cards).toHaveLength(1);
  });
});

describe("createDeck", () => {
  it("creates a deck with the given name and format", () => {
    const deck = createDeck("My EDH", "commander");
    expect(deck.name).toBe("My EDH");
    expect(deck.format).toBe("commander");
    expect(deck.cards).toEqual([]);
    expect(deck.id).toMatch(/^deck-/);
  });
});

describe("deleteDeck", () => {
  it("removes a deck from the list", () => {
    const decks: Deck[] = [emptyDeck, { ...emptyDeck, id: "deck-2", name: "Other" }];
    const result = deleteDeck(decks, "deck-1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("deck-2");
  });

  it("does not remove last deck", () => {
    const result = deleteDeck([emptyDeck], emptyDeck.id);
    expect(result).toHaveLength(1);
  });
});

describe("importDecklist", () => {
  it("parses qty and name from standard format", () => {
    const lines = importDecklist("4 Lightning Bolt\n2 Counterspell\n1 Sol Ring");
    expect(lines).toEqual([
      { qty: 4, name: "Lightning Bolt" },
      { qty: 2, name: "Counterspell" },
      { qty: 1, name: "Sol Ring" },
    ]);
  });

  it("handles Nx format", () => {
    const lines = importDecklist("4x Lightning Bolt");
    expect(lines).toEqual([{ qty: 4, name: "Lightning Bolt" }]);
  });

  it("skips blank lines and comments", () => {
    const lines = importDecklist("# Creatures\n\n4 Goblin Guide\n// sideboard");
    expect(lines).toEqual([{ qty: 4, name: "Goblin Guide" }]);
  });

  it("defaults qty to 1 for lines without a number", () => {
    const lines = importDecklist("Sol Ring");
    expect(lines).toEqual([{ qty: 1, name: "Sol Ring" }]);
  });
});

describe("exportDecklist", () => {
  it("exports in standard format", () => {
    const cards: DeckCard[] = [
      { ...makeCard(), qty: 4 },
      { ...makeCard({ id: "card-2", name: "Counterspell" }), qty: 2 },
    ];
    const result = exportDecklist(cards);
    expect(result).toBe("4 Lightning Bolt\n2 Counterspell");
  });

  it("returns empty string for empty deck", () => {
    expect(exportDecklist([])).toBe("");
  });
});

describe("sortDeckCards", () => {
  const cards: DeckCard[] = [
    { ...makeCard({ id: "1", name: "Bolt", cmc: 1 }), qty: 1 },
    { ...makeCard({ id: "2", name: "Anger", cmc: 4, type_line: "Enchantment", color_identity: ["R", "W"], prices: { usd: "5.00" } }), qty: 1 },
    { ...makeCard({ id: "3", name: "Cancel", cmc: 3, type_line: "Instant", color_identity: ["U"], prices: { usd: "0.25" } }), qty: 1 },
  ];

  it("sorts by name", () => {
    const sorted = sortDeckCards(cards, "name");
    expect(sorted.map((c) => c.name)).toEqual(["Anger", "Bolt", "Cancel"]);
  });

  it("sorts by cmc", () => {
    const sorted = sortDeckCards(cards, "cmc");
    expect(sorted.map((c) => c.cmc)).toEqual([1, 3, 4]);
  });

  it("sorts by type", () => {
    const sorted = sortDeckCards(cards, "type");
    expect(sorted.map((c) => c.type_line)).toEqual(["Enchantment", "Instant", "Instant"]);
  });

  it("sorts by price descending", () => {
    const sorted = sortDeckCards(cards, "price");
    expect(sorted.map((c) => c.name)).toEqual(["Anger", "Bolt", "Cancel"]);
  });
});
