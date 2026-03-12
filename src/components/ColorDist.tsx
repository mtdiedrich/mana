import { memo } from "react";
import { COLORS, T } from "../constants";

interface ColorDistProps {
  dist: Record<string, number>;
}

export const ColorDist = memo(function ColorDist({ dist }: ColorDistProps) {
  const total = Object.values(dist).reduce((s, v) => s + v, 0) || 1;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {Object.entries(dist)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: COLORS[k]?.bg ?? "#999",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            />
            <span style={{ fontSize: 12, color: T.textMuted }}>
              {k}: {v} ({Math.round((v / total) * 100)}%)
            </span>
          </div>
        ))}
    </div>
  );
});
