import { useState, useEffect, useCallback } from "react";
import type { Deck, DeckCard, ScryfallCard } from "../types";
import {
  addCardToDeck,
  removeCardFromDeck,
  createDeck as createDeckFn,
  deleteDeck as deleteDeckFn,
  importDecklist,
  exportDecklist,
} from "../deck";
import { cardByName } from "../scryfall";

const STORAGE_PREFIX = "mtg-decks";

const DEFAULT_DECKS: Deck[] = [
  { id: "default", name: "My Deck", cards: [], format: "commander" },
];

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}-${userId}`;
}

function loadDecks(userId: string): Deck[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw) as Deck[];
  } catch {
    // ignore
  }
  return DEFAULT_DECKS;
}

function saveDecks(userId: string, decks: Deck[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(decks));
  } catch {
    // ignore
  }
}

export function useDeckManager(userId: string) {
  const [decks, setDecks] = useState<Deck[]>(() => loadDecks(userId));
  const [activeDeckId, setActiveDeckId] = useState(() => loadDecks(userId)[0].id);

  // Reload when userId changes
  useEffect(() => {
    const loaded = loadDecks(userId);
    setDecks(loaded);
    setActiveDeckId(loaded[0].id);
  }, [userId]);

  const activeDeck = decks.find((d) => d.id === activeDeckId) ?? decks[0];

  // Persist on change
  useEffect(() => {
    saveDecks(userId, decks);
  }, [userId, decks]);

  const addToDeck = useCallback(
    (card: ScryfallCard) => {
      setDecks((prev) =>
        prev.map((d) => (d.id === activeDeckId ? addCardToDeck(d, card) : d)),
      );
    },
    [activeDeckId],
  );

  const removeFromDeck = useCallback(
    (cardId: string) => {
      setDecks((prev) =>
        prev.map((d) =>
          d.id === activeDeckId ? removeCardFromDeck(d, cardId) : d,
        ),
      );
    },
    [activeDeckId],
  );

  const createDeck = useCallback(
    (name: string, format: string) => {
      if (!name.trim()) return;
      const deck = createDeckFn(name.trim(), format);
      setDecks((prev) => [...prev, deck]);
      setActiveDeckId(deck.id);
    },
    [],
  );

  const deleteActiveDeck = useCallback(() => {
    setDecks((prev) => {
      const next = deleteDeckFn(prev, activeDeckId);
      if (next.length < prev.length) {
        setActiveDeckId(next[0].id);
      }
      return next;
    });
  }, [activeDeckId]);

  const importCards = useCallback(
    async (text: string): Promise<void> => {
      const lines = importDecklist(text);
      const cards: DeckCard[] = [];

      for (const line of lines) {
        try {
          const card = await cardByName(line.name);
          if (card) cards.push({ ...card, qty: line.qty });
          // Rate limiting
          await new Promise((r) => setTimeout(r, 80));
        } catch {
          // skip unresolvable cards
        }
      }

      if (cards.length) {
        setDecks((prev) =>
          prev.map((d) => {
            if (d.id !== activeDeckId) return d;
            const merged = [...d.cards];
            for (const c of cards) {
              const existing = merged.find((x) => x.id === c.id);
              if (existing) existing.qty += c.qty;
              else merged.push(c);
            }
            return { ...d, cards: merged };
          }),
        );
      }
    },
    [activeDeckId],
  );

  const exportCards = useCallback(() => {
    const text = exportDecklist(activeDeck.cards);
    navigator.clipboard?.writeText(text);
  }, [activeDeck]);

  return {
    decks,
    activeDeck,
    activeDeckId,
    setActiveDeckId,
    addToDeck,
    removeFromDeck,
    createDeck,
    deleteActiveDeck,
    importCards,
    exportCards,
  };
}
