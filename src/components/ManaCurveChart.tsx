import { memo } from "react";
import { T, CURVE_KEYS } from "../constants";

interface ManaCurveChartProps {
  curve: Record<string, number>;
}

export const ManaCurveChart = memo(function ManaCurveChart({ curve }: ManaCurveChartProps) {
  const max = Math.max(...CURVE_KEYS.map((k) => curve[k] ?? 0), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
      {CURVE_KEYS.map((k) => {
        const value = curve[k] ?? 0;
        return (
          <div
            key={k}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <span style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
              {value || ""}
            </span>
            <div
              style={{
                width: "100%",
                height: (value / max) * 100,
                minHeight: value > 0 ? 4 : 0,
                background: `linear-gradient(to top, ${T.accent}, ${T.accentHover})`,
                borderRadius: "4px 4px 0 0",
                transition: "height 0.3s",
              }}
            />
            <span style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>{k}</span>
          </div>
        );
      })}
    </div>
  );
});
