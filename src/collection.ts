import type { DeckCard, ScryfallCard } from "./types";

/** Add a card to the collection, incrementing qty if it already exists. Returns a new array. */
export function addToCollection(
  collection: DeckCard[],
  card: ScryfallCard,
): DeckCard[] {
  const existing = collection.find((c) => c.id === card.id);
  if (existing) {
    return collection.map((c) =>
      c.id === card.id ? { ...c, qty: c.qty + 1 } : c,
    );
  }
  return [...collection, { ...card, qty: 1 }];
}

/** Remove one copy of a card from the collection. Removes entirely if qty reaches 0. Returns a new array. */
export function removeFromCollection(
  collection: DeckCard[],
  cardId: string,
): DeckCard[] {
  const existing = collection.find((c) => c.id === cardId);
  if (!existing) return collection;

  if (existing.qty > 1) {
    return collection.map((c) =>
      c.id === cardId ? { ...c, qty: c.qty - 1 } : c,
    );
  }
  return collection.filter((c) => c.id !== cardId);
}
