import { useState, useCallback, useEffect } from "react";
import type { DeckCard, ScryfallCard } from "../types";

const STORAGE_KEY = "mtg-collection";

function loadCollection(): DeckCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DeckCard[];
  } catch {
    // ignore
  }
  return [];
}

function saveCollection(collection: DeckCard[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
  } catch {
    // ignore
  }
}

export function useCollection() {
  const [collection, setCollection] = useState<DeckCard[]>(loadCollection);

  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

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
