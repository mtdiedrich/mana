import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDeckManager } from "./useDeckManager";

beforeEach(() => {
  localStorage.clear();
});

describe("useDeckManager — per-user storage", () => {
  it("stores decks under a user-specific key", () => {
    renderHook(() => useDeckManager("user-a"));

    expect(localStorage.getItem("mtg-decks-user-a")).not.toBeNull();
    expect(localStorage.getItem("mtg-decks")).toBeNull();
  });

  it("different users have independent decks", () => {
    const hookA = renderHook(() => useDeckManager("user-a"));
    const hookB = renderHook(() => useDeckManager("user-b"));

    act(() => hookA.result.current.createDeck("Elves", "standard"));

    // user-a should have 2 decks (default + Elves)
    expect(hookA.result.current.decks).toHaveLength(2);
    // user-b should still have just the default
    expect(hookB.result.current.decks).toHaveLength(1);
  });

  it("loads persisted decks for the correct user", () => {
    const decks = [{ id: "d1", name: "Saved Deck", cards: [], format: "standard" }];
    localStorage.setItem("mtg-decks-user-x", JSON.stringify(decks));

    const { result } = renderHook(() => useDeckManager("user-x"));

    expect(result.current.decks).toHaveLength(1);
    expect(result.current.decks[0].name).toBe("Saved Deck");
  });

  it("does not load another user's decks", () => {
    const decks = [{ id: "d1", name: "Other Deck", cards: [], format: "commander" }];
    localStorage.setItem("mtg-decks-user-a", JSON.stringify(decks));

    const { result } = renderHook(() => useDeckManager("user-b"));

    // Should have only the default deck, not user-a's deck
    expect(result.current.decks).toHaveLength(1);
    expect(result.current.decks[0].name).toBe("My Deck");
  });
});
