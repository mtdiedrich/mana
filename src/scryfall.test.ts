import { describe, it, expect } from "vitest";
import { buildQuery } from "./scryfall";

describe("buildQuery", () => {
  it("returns text as-is when no filters", () => {
    expect(buildQuery("lightning bolt")).toBe("lightning bolt");
  });

  it("appends color filters", () => {
    expect(buildQuery("bolt", { colors: ["r"] })).toBe("bolt c:r");
  });

  it("appends multiple color filters", () => {
    expect(buildQuery("draw", { colors: ["u", "w"] })).toBe("draw c:uc:w");
  });

  it("appends type filter", () => {
    expect(buildQuery("", { type: "creature" })).toBe(" t:creature");
  });

  it("appends mana value filter", () => {
    expect(buildQuery("elves", { mv: "3" })).toBe("elves mv=3");
  });

  it("appends rarity filter", () => {
    expect(buildQuery("", { rarity: "mythic" })).toBe(" r:mythic");
  });

  it("combines all filters", () => {
    const result = buildQuery("dragon", {
      colors: ["r"],
      type: "creature",
      mv: "5",
      rarity: "rare",
    });
    expect(result).toBe("dragon c:r t:creature mv=5 r:rare");
  });
});
