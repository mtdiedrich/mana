import { describe, it, expect } from "vitest";
import { computeDeckStats } from "./stats";
import type { DeckCard } from "./types";

const makeCards = (): DeckCard[] => [
  {
    id: "1", name: "Lightning Bolt", qty: 4,
    cmc: 1, mana_cost: "{R}", type_line: "Instant",
    color_identity: ["R"], prices: { usd: "1.50" },
  },
  {
    id: "2", name: "Counterspell", qty: 2,
    cmc: 2, mana_cost: "{U}{U}", type_line: "Instant",
    color_identity: ["U"], prices: { usd: "1.00" },
  },
  {
    id: "3", name: "Tarmogoyf", qty: 3,
    cmc: 2, mana_cost: "{1}{G}", type_line: "Creature — Lhurgoyf",
    color_identity: ["G"], prices: { usd: "10.00" },
  },
  {
    id: "4", name: "Command Tower", qty: 1,
    cmc: 0, type_line: "Land",
    color_identity: [], prices: { usd: "0.50" },
  },
];

describe("computeDeckStats", () => {
  const stats = computeDeckStats(makeCards());

  it("computes total card count", () => {
    expect(stats.totalCards).toBe(10); // 4+2+3+1
  });

  it("computes total value", () => {
    // 4*1.50 + 2*1.00 + 3*10.00 + 1*0.50 = 6+2+30+0.5 = 38.5
    expect(stats.totalValue).toBeCloseTo(38.5);
  });

  it("computes land count", () => {
    expect(stats.landCount).toBe(1);
  });

  it("computes mana curve (excluding lands)", () => {
    expect(stats.manaCurve["1"]).toBe(4); // Bolt
    expect(stats.manaCurve["2"]).toBe(5); // Counterspell + Tarmogoyf
    expect(stats.manaCurve["0"]).toBeUndefined();
  });

  it("computes color distribution", () => {
    expect(stats.colorDistribution["R"]).toBe(4);
    expect(stats.colorDistribution["U"]).toBe(2);
    expect(stats.colorDistribution["G"]).toBe(3);
    expect(stats.colorDistribution["C"]).toBe(1); // Command Tower (no color identity)
  });

  it("computes type breakdown", () => {
    expect(stats.typeBreakdown["Instant"]).toBe(6);
    expect(stats.typeBreakdown["Creature"]).toBe(3);
    expect(stats.typeBreakdown["Land"]).toBe(1);
  });

  it("handles empty card list", () => {
    const empty = computeDeckStats([]);
    expect(empty.totalCards).toBe(0);
    expect(empty.totalValue).toBe(0);
    expect(empty.landCount).toBe(0);
  });
});
