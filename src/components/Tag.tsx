import type { ReactNode } from "react";
import { T } from "../constants";

interface TagProps {
  children: ReactNode;
  color?: "gold" | "green" | "red";
}

export function Tag({ children, color }: TagProps) {
  const map: Record<string, [string, string]> = {
    gold: [T.accentDim, T.accent],
    green: [T.successDim, T.success],
    red: [T.dangerDim, T.danger],
  };
  const [bg, fg] = color ? map[color] : [T.border, T.textMuted];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        background: bg,
        color: fg,
      }}
    >
      {children}
    </span>
  );
}
