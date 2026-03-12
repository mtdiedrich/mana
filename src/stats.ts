import type { DeckCard, DeckStats } from "./types";

/** Compute deck statistics from an array of deck cards */
export function computeDeckStats(cards: DeckCard[]): DeckStats {
  const totalCards = cards.reduce((sum, c) => sum + c.qty, 0);
  const totalValue = cards.reduce(
    (sum, c) => sum + parseFloat(c.prices?.usd ?? "0") * c.qty,
    0,
  );

  const manaCurve: Record<string, number> = {};
  for (const card of cards) {
    if (card.type_line?.includes("Land")) continue;
    const key = (card.cmc ?? 0) >= 7 ? "7+" : String(Math.floor(card.cmc ?? 0));
    manaCurve[key] = (manaCurve[key] ?? 0) + card.qty;
  }

  const colorDistribution: Record<string, number> = {
    W: 0, U: 0, B: 0, R: 0, G: 0, C: 0,
  };
  for (const card of cards) {
    const ci = card.color_identity ?? [];
    if (ci.length === 0) {
      colorDistribution["C"] += card.qty;
    } else {
      for (const color of ci) {
        if (color in colorDistribution) {
          colorDistribution[color] += card.qty;
        }
      }
    }
  }

  const typeBreakdown: Record<string, number> = {};
  for (const card of cards) {
    const typePart = (card.type_line ?? "").split("—")[0].trim();
    const mainType = typePart.split(" ").pop() ?? "Unknown";
    typeBreakdown[mainType] = (typeBreakdown[mainType] ?? 0) + card.qty;
  }

  const landCount = cards
    .filter((c) => c.type_line?.includes("Land"))
    .reduce((sum, c) => sum + c.qty, 0);

  return {
    totalCards,
    totalValue,
    manaCurve,
    colorDistribution,
    typeBreakdown,
    landCount,
  };
}
