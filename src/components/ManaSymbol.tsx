import { memo } from "react";
import { COLORS, GENERIC_MANA_BG, GENERIC_MANA_FG } from "../constants";

interface ManaSymbolProps {
  symbol: string;
  size?: number;
}

export const ManaSymbol = memo(function ManaSymbol({ symbol, size = 16 }: ManaSymbolProps) {
  const c = COLORS[symbol];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: c ? c.bg : GENERIC_MANA_BG,
        color: c ? c.fg : GENERIC_MANA_FG,
        fontSize: size * 0.6,
        fontWeight: 700,
        lineHeight: 1,
        border: "1px solid rgba(0,0,0,0.25)",
        flexShrink: 0,
        boxShadow:
          "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
      }}
    >
      {symbol}
    </span>
  );
});
