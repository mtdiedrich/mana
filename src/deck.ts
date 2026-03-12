import type { Deck, DeckCard, ScryfallCard, SortKey } from "./types";

/** Add a card to a deck, incrementing qty if it already exists. Returns a new deck. */
export function addCardToDeck(deck: Deck, card: ScryfallCard): Deck {
  const existing = deck.cards.find((c) => c.id === card.id);
  if (existing) {
    return {
      ...deck,
      cards: deck.cards.map((c) =>
        c.id === card.id ? { ...c, qty: c.qty + 1 } : c,
      ),
    };
  }
  return {
    ...deck,
    cards: [...deck.cards, { ...card, qty: 1 }],
  };
}

/** Remove one copy of a card from a deck. Removes entirely if qty reaches 0. Returns a new deck. */
export function removeCardFromDeck(deck: Deck, cardId: string): Deck {
  const existing = deck.cards.find((c) => c.id === cardId);
  if (!existing) return deck;

  if (existing.qty > 1) {
    return {
      ...deck,
      cards: deck.cards.map((c) =>
        c.id === cardId ? { ...c, qty: c.qty - 1 } : c,
      ),
    };
  }
  return {
    ...deck,
    cards: deck.cards.filter((c) => c.id !== cardId),
  };
}

/** Create a new deck with the given name and format */
export function createDeck(name: string, format: string): Deck {
  return {
    id: `deck-${Date.now()}`,
    name,
    cards: [],
    format,
  };
}

/** Remove a deck from the list. Refuses to delete the last deck. */
export function deleteDeck(decks: Deck[], deckId: string): Deck[] {
  if (decks.length <= 1) return decks;
  return decks.filter((d) => d.id !== deckId);
}

/** Parsed import line */
export interface ImportLine {
  qty: number;
  name: string;
}

/** Parse a decklist string into qty+name pairs */
export function importDecklist(text: string): ImportLine[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("#"))
    .map((line) => {
      const m = line.match(/^(\d+)x?\s+(.+)$/i);
      const qty = m ? parseInt(m[1], 10) || 1 : 1;
      const name = m ? m[2].trim() : line.trim();
      return { qty, name };
    });
}

/** Export deck cards as a decklist string */
export function exportDecklist(cards: DeckCard[]): string {
  return cards.map((c) => `${c.qty} ${c.name}`).join("\n");
}

/** Sort deck cards by a given key. Returns a new sorted array. */
export function sortDeckCards(cards: DeckCard[], sortBy: SortKey): DeckCard[] {
  const sorted = [...cards];
  const comparators: Record<SortKey, (a: DeckCard, b: DeckCard) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    cmc: (a, b) => (a.cmc ?? 0) - (b.cmc ?? 0),
    type: (a, b) => (a.type_line ?? "").localeCompare(b.type_line ?? ""),
    price: (a, b) =>
      parseFloat(b.prices?.usd ?? "0") - parseFloat(a.prices?.usd ?? "0"),
    color: (a, b) =>
      (a.color_identity ?? []).join("").localeCompare(
        (b.color_identity ?? []).join(""),
      ),
  };
  return sorted.sort(comparators[sortBy]);
}
