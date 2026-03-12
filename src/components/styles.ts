import type { CSSProperties } from "react";
import { T } from "../constants";

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  color: T.text,
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

export const selectStyle: CSSProperties = {
  padding: "6px 10px",
  background: T.surface,
  border: `1px solid ${T.border}`,
  borderRadius: 6,
  color: T.text,
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
  outline: "none",
};

export const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: 12,
};

export function navBtnStyle(active: boolean): CSSProperties {
  return {
    padding: "8px 16px",
    background: active ? T.accentDim : "transparent",
    color: active ? T.accent : T.textMuted,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
  };
}
