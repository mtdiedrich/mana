/** Mana color styling */
export interface ColorStyle {
  bg: string;
  fg: string;
  border: string;
}

export const COLORS: Record<string, ColorStyle> = {
  W: { bg: "#F9FAF4", fg: "#33302D", border: "#D4C5A9" },
  U: { bg: "#0E68AB", fg: "#FFF", border: "#0A4F82" },
  B: { bg: "#150B00", fg: "#AD9F93", border: "#3D2B1F" },
  R: { bg: "#D3202A", fg: "#FFF", border: "#A01820" },
  G: { bg: "#00733E", fg: "#FFF", border: "#005A2F" },
  C: { bg: "#CBB5A0", fg: "#33302D", border: "#A89780" },
};

export const GENERIC_MANA_BG = "#CBC2BF";
export const GENERIC_MANA_FG = "#33302D";

/** Theme colors */
export const T = {
  bg: "#0D0F0E",
  surface: "#161A18",
  surfaceHover: "#1C211F",
  card: "#1A1F1D",
  border: "#2A302D",
  text: "#E8EBE9",
  textMuted: "#8A938E",
  textDim: "#5A635E",
  accent: "#C9A227",
  accentDim: "rgba(201,162,39,0.15)",
  accentHover: "#D4AF37",
  danger: "#C44536",
  dangerDim: "rgba(196,69,54,0.15)",
  success: "#4A9B6E",
  successDim: "rgba(74,155,110,0.15)",
} as const;

export const FORMATS = [
  "commander",
  "standard",
  "modern",
  "pioneer",
  "legacy",
  "vintage",
  "pauper",
  "casual",
] as const;

export const CARD_TYPES = [
  "creature",
  "instant",
  "sorcery",
  "enchantment",
  "artifact",
  "planeswalker",
  "land",
] as const;

export const RARITIES = ["common", "uncommon", "rare", "mythic"] as const;

export const LEGALITY_FORMATS = [
  "standard",
  "pioneer",
  "modern",
  "legacy",
  "commander",
  "pauper",
] as const;

/** Mana curve bucket keys */
export const CURVE_KEYS = ["0", "1", "2", "3", "4", "5", "6", "7+"] as const;
