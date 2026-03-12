import type { ScryfallCard } from "./types";

/** Format a price string as "$X.XX" or "—" if missing */
export function fmtPrice(price: string | undefined): string {
  if (!price) return "—";
  return `$${parseFloat(price).toFixed(2)}`;
}

/** Capitalize the first letter of a string */
export function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

/** Get a card image URL at the given size, falling back to the first face */
export function cardImg(
  card: ScryfallCard | undefined | null,
  size: keyof NonNullable<ScryfallCard["image_uris"]> = "small",
): string | null {
  if (!card) return null;
  return (
    card.image_uris?.[size] ??
    card.card_faces?.[0]?.image_uris?.[size] ??
    null
  );
}
