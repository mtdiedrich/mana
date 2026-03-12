import { memo } from "react";
import { ManaSymbol } from "./ManaSymbol";

interface ManaCostProps {
  cost?: string;
  size?: number;
}

export const ManaCost = memo(function ManaCost({ cost, size = 16 }: ManaCostProps) {
  if (!cost) return null;
  const symbols = cost.match(/\{([^}]+)\}/g) ?? [];
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {symbols.map((s, i) => (
        <ManaSymbol
          key={i}
          symbol={s.replace(/[{}]/g, "").replace("/", "")}
          size={size}
        />
      ))}
    </span>
  );
});
