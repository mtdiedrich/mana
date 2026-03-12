/** Mana color identity */
export type Color = "W" | "U" | "B" | "R" | "G";

/** Authenticated user (public-facing, no password hash) */
export interface UserPublic {
  id: string;
  email: string;
  displayName: string;
}

/** Auth result returned to client */
export interface AuthResult {
  user: UserPublic;
  token: string;
}

/** Deck as returned by the API */
export interface DeckResponse {
  id: string;
  name: string;
  format: string;
  cards: DeckCardResponse[];
  createdAt: string;
  updatedAt: string;
}

/** A card within a deck */
export interface DeckCardResponse {
  id: string;
  scryfallId: string;
  name: string;
  qty: number;
  cardData: Record<string, unknown>;
}

/** A card in the collection */
export interface CollectionCardResponse {
  id: string;
  scryfallId: string;
  name: string;
  qty: number;
  cardData: Record<string, unknown>;
}

/** Standard API error */
export interface ApiError {
  error: string;
}
