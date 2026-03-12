/** Scryfall card image URIs */
export interface ImageUris {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  art_crop?: string;
  border_crop?: string;
}

/** One face of a double-faced card */
export interface CardFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  image_uris?: ImageUris;
  power?: string;
  toughness?: string;
  loyalty?: string;
}

/** Scryfall card price info */
export interface Prices {
  usd?: string;
  usd_foil?: string;
  eur?: string;
  tix?: string;
}

/** Purchase links */
export interface PurchaseUris {
  tcgplayer?: string;
  cardmarket?: string;
  cardhoarder?: string;
}

/** Legality per format */
export type Legality = "legal" | "not_legal" | "banned" | "restricted";

export type LegalityMap = Record<string, Legality>;

/** Mana color identity */
export type Color = "W" | "U" | "B" | "R" | "G";

/** A Scryfall card object (subset of fields we use) */
export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc?: number;
  type_line?: string;
  oracle_text?: string;
  flavor_text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  color_identity?: Color[];
  colors?: Color[];
  rarity?: string;
  set_name?: string;
  image_uris?: ImageUris;
  card_faces?: CardFace[];
  prices?: Prices;
  purchase_uris?: PurchaseUris;
  legalities?: LegalityMap;
  scryfall_uri?: string;
}

/** A card stored in a deck or collection, with quantity */
export interface DeckCard extends ScryfallCard {
  qty: number;
}

/** A user deck */
export interface Deck {
  id: string;
  name: string;
  cards: DeckCard[];
  format: string;
}

/** Deck statistics */
export interface DeckStats {
  totalCards: number;
  totalValue: number;
  manaCurve: Record<string, number>;
  colorDistribution: Record<string, number>;
  typeBreakdown: Record<string, number>;
  landCount: number;
}

/** Sort options for deck view */
export type SortKey = "name" | "cmc" | "type" | "color" | "price";

/** Application view */
export type ViewName = "search" | "deck" | "collection";

/** Scryfall search response */
export interface ScryfallSearchResponse {
  data: ScryfallCard[];
  total_cards: number;
  has_more: boolean;
}

/** Scryfall autocomplete response */
export interface ScryfallAutocompleteResponse {
  data: string[];
}
