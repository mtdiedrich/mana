import { memo, useState } from "react";
import { T } from "../constants";
import { cardImg } from "../helpers";
import type { ScryfallCard } from "../types";

interface CardGridItemProps {
  card: ScryfallCard;
  onClick: (card: ScryfallCard) => void;
}

export const CardGridItem = memo(function CardGridItem({ card, onClick }: CardGridItemProps) {
  const img = cardImg(card);
  const [hovered, setHovered] = useState(false);

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
    </div>
  );
});
