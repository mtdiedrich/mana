import type {
  ScryfallCard,
  ScryfallSearchResponse,
  ScryfallAutocompleteResponse,
} from "./types";

const BASE_URL = "https://api.scryfall.com";

/** Low-level Scryfall fetch; returns null on 404, throws on other errors */
export async function scry<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Scryfall error ${res.status}`);
  return res.json() as Promise<T>;
}

/** Search parameters for building Scryfall queries */
export interface SearchFilters {
  colors?: string[];
  type?: string;
  mv?: string;
  rarity?: string;
}

/** Build a Scryfall query string from text + filters */
export function buildQuery(text: string, filters: SearchFilters = {}): string {
  let q = text || "";
  if (filters.colors?.length) {
    q += " " + filters.colors.map((c) => `c:${c}`).join("");
  }
  if (filters.type) q += ` t:${filters.type}`;
  if (filters.mv) q += ` mv=${filters.mv}`;
  if (filters.rarity) q += ` r:${filters.rarity}`;
  return q;
}

/** Search for cards */
export async function searchCards(
  query: string,
  page = 1,
): Promise<ScryfallSearchResponse | null> {
  return scry<ScryfallSearchResponse>(
    `/cards/search?q=${encodeURIComponent(query)}&page=${page}&unique=cards`,
  );
}

/** Get autocomplete suggestions */
export async function autocomplete(
  query: string,
): Promise<string[]> {
  const data = await scry<ScryfallAutocompleteResponse>(
    `/cards/autocomplete?q=${encodeURIComponent(query)}`,
  );
  return data?.data ?? [];
}

/** Look up a card by fuzzy name */
export async function cardByName(
  name: string,
): Promise<ScryfallCard | null> {
  return scry<ScryfallCard>(
    `/cards/named?fuzzy=${encodeURIComponent(name)}`,
  );
}
