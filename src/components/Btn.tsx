import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { T } from "../constants";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "accent" | "danger";
  style?: CSSProperties;
}

export function Btn({ children, variant = "default", style: extraStyle, ...props }: BtnProps) {
  const base: CSSProperties =
    variant === "accent"
      ? { background: T.accent, color: "#000", border: "none" }
      : variant === "danger"
        ? { background: T.danger, color: "#FFF", border: "none" }
        : { background: T.surface, color: T.text, border: `1px solid ${T.border}` };

  return (
    <button
      style={{
        padding: "6px 12px",
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 500,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        ...base,
        ...extraStyle,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
