import { useState, useCallback, useEffect } from "react";
import type { DeckCard, ScryfallCard } from "../types";

function storageKey(userId: string) {
  return `mtg-collection-${userId}`;
}

function loadCollection(userId: string): DeckCard[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw) as DeckCard[];
  } catch {
    // ignore
  }
  return [];
}

function saveCollection(userId: string, collection: DeckCard[]) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(collection));
  } catch {
    // ignore
  }
}

export function useCollection(userId: string) {
  const [collection, setCollection] = useState<DeckCard[]>(() => loadCollection(userId));

  // Reload when userId changes
  useEffect(() => {
    setCollection(loadCollection(userId));
  }, [userId]);

  useEffect(() => {
    saveCollection(userId, collection);
  }, [userId, collection]);

  const addToCollection = useCallback((card: ScryfallCard) => {
    setCollection((prev) => {
      const existing = prev.find((c) => c.id === card.id);
      if (existing) {
        return prev.map((c) =>
          c.id === card.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prev, { ...card, qty: 1 }];
    });
  }, []);

  const removeFromCollection = useCallback((cardId: string) => {
    setCollection((prev) => {
      const existing = prev.find((c) => c.id === cardId);
      if (!existing) return prev;
      if (existing.qty > 1) {
        return prev.map((c) =>
          c.id === cardId ? { ...c, qty: c.qty - 1 } : c,
        );
      }
      return prev.filter((c) => c.id !== cardId);
    });
  }, []);

  return { collection, addToCollection, removeFromCollection };
}
