import { memo, useState } from "react";
import { T } from "../constants";
import { cardImg } from "../helpers";
import type { ScryfallCard } from "../types";

interface CardGridItemProps {
  card: ScryfallCard;
  onClick: (card: ScryfallCard) => void;
  collectionQty?: number;
  onAdd?: (card: ScryfallCard) => void;
  onRemove?: (cardId: string) => void;
}

export const CardGridItem = memo(function CardGridItem({
  card,
  onClick,
  collectionQty,
  onAdd,
  onRemove,
}: CardGridItemProps) {
  const img = cardImg(card);
  const [hovered, setHovered] = useState(false);
  const showOverlay = hovered && onAdd && onRemove && collectionQty !== undefined;

  return (
    <div
      onClick={() => onClick(card)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        cursor: "pointer",
        aspectRatio: "488/680",
        background: T.card,
        transform: hovered ? "scale(1.03)" : "scale(1)",
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
    >
      {img ? (
        <img
          src={img}
          alt={card.name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 16,
            textAlign: "center",
            fontSize: 14,
            color: T.textMuted,
          }}
        >
          {card.name}
        </div>
      )}
      {showOverlay && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 4,
            padding: "8px 12px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(card.id);
            }}
            style={{
              width: 32,
              height: 28,
              borderRadius: 4,
              border: `1px solid ${T.border}`,
              background: T.surface,
              color: T.text,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            −
          </button>
          <span
            style={{
              minWidth: 28,
              height: 28,
              borderRadius: 4,
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.accent,
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {collectionQty}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(card);
            }}
            style={{
              width: 32,
              height: 28,
              borderRadius: 4,
              border: `1px solid ${T.border}`,
              background: T.surface,
              color: T.text,
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
});
