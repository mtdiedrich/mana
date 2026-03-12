import { memo, useState } from "react";
import { T } from "../constants";
import { cardImg, fmtPrice } from "../helpers";
import { ManaCost } from "./ManaCost";
import { Btn } from "./Btn";
import type { DeckCard } from "../types";

interface CardRowProps {
  card: DeckCard;
  onClick: (card: DeckCard) => void;
  onAdd: (card: DeckCard) => void;
  onRemove: (cardId: string) => void;
  showSet?: boolean;
}

export const CardRow = memo(function CardRow({
  card,
  onClick,
  onAdd,
  onRemove,
  showSet,
}: CardRowProps) {
  const img = cardImg(card);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onClick(card)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 6,
        cursor: "pointer",
        background: hovered ? T.surfaceHover : T.surface,
        transition: "background 0.1s",
        minHeight: 44,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: T.accent, minWidth: 24 }}>
        {card.qty}×
      </span>
      {img && (
        <img
          src={img}
          alt=""
          style={{ width: 28, height: 40, borderRadius: 3, objectFit: "cover" }}
        />
      )}
      <span style={{ flex: 1, fontSize: 14, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{card.name}</span>
      <ManaCost cost={card.mana_cost} size={14} />
      {showSet && (
        <span style={{ fontSize: 12, color: T.textDim, minWidth: 80, display: "none" }} className="card-row-set">
          {card.set_name}
        </span>
      )}
      <span style={{ fontSize: 12, color: T.textMuted, minWidth: 50, textAlign: "right" }}>
        {fmtPrice(card.prices?.usd)}
      </span>
      <Btn
        style={{ padding: "8px 12px", fontSize: 14, minWidth: 36, minHeight: 36 }}
        onClick={(e) => {
          e.stopPropagation();
          onAdd(card);
        }}
      >
        +
      </Btn>
      <Btn
        style={{ padding: "8px 12px", fontSize: 14, minWidth: 36, minHeight: 36 }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(card.id);
        }}
      >
        −
      </Btn>
    </div>
  );
});
