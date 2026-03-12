import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCollection } from "./useCollection";
import type { ScryfallCard } from "../types";

const makeCard = (overrides: Partial<ScryfallCard> = {}): ScryfallCard => ({
  id: "card-1",
  name: "Sol Ring",
  prices: { usd: "3.00" },
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
});

describe("useCollection — per-user storage", () => {
  it("stores cards under a user-specific key", () => {
    const { result } = renderHook(() => useCollection("user-a"));

    act(() => result.current.addToCollection(makeCard()));

    expect(localStorage.getItem("mtg-collection-user-a")).not.toBeNull();
    expect(localStorage.getItem("mtg-collection")).toBeNull();
  });

  it("different users have independent collections", () => {
    const hookA = renderHook(() => useCollection("user-a"));
    const hookB = renderHook(() => useCollection("user-b"));

    act(() => hookA.result.current.addToCollection(makeCard({ id: "c1", name: "Sol Ring" })));

    expect(hookA.result.current.collection).toHaveLength(1);
    expect(hookB.result.current.collection).toHaveLength(0);
  });

  it("loads persisted collection for the correct user", () => {
    const card = { ...makeCard(), qty: 2 };
    localStorage.setItem("mtg-collection-user-x", JSON.stringify([card]));

    const { result } = renderHook(() => useCollection("user-x"));

    expect(result.current.collection).toHaveLength(1);
    expect(result.current.collection[0].qty).toBe(2);
  });

  it("does not load another user's collection", () => {
    const card = { ...makeCard(), qty: 2 };
    localStorage.setItem("mtg-collection-user-a", JSON.stringify([card]));

    const { result } = renderHook(() => useCollection("user-b"));

    expect(result.current.collection).toHaveLength(0);
  });
});
