import { memo, useState } from "react";
import { T, LEGALITY_FORMATS } from "../constants";
import { cardImg, fmtPrice } from "../helpers";
import { ManaCost } from "./ManaCost";
import { Tag } from "./Tag";
import { Btn } from "./Btn";
import type { ScryfallCard } from "../types";

interface CardDetailModalProps {
  card: ScryfallCard | null;
  onClose: () => void;
  onAddDeck: (card: ScryfallCard) => void;
  onAddCollection: (card: ScryfallCard) => void;
}

export const CardDetailModal = memo(function CardDetailModal({
  card,
  onClose,
  onAddDeck,
  onAddCollection,
}: CardDetailModalProps) {
  const [showBack, setShowBack] = useState(false);

  if (!card) return null;

  const img = cardImg(card, "normal");
  const backImg = card.card_faces?.[1]?.image_uris?.normal;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: 24,
          maxWidth: 800,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative",
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Card Image */}
        <div style={{ flex: "0 0 280px", maxWidth: 280 }}>
          <img
            src={showBack && backImg ? backImg : (img ?? undefined)}
            alt={card.name}
            style={{ width: "100%", borderRadius: 10 }}
          />
          {backImg && (
            <Btn
              style={{ marginTop: 8, width: "100%", justifyContent: "center" }}
              onClick={() => setShowBack(!showBack)}
            >
              {showBack ? "Show Front" : "Show Back"}
            </Btn>
          )}
        </div>

        {/* Card Details */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: "'Cinzel', serif" }}>
              {card.name}
            </h2>
            <ManaCost cost={card.mana_cost} size={18} />
          </div>

          <p style={{ color: T.textMuted, fontSize: 14, margin: "4px 0 12px" }}>
            {card.type_line}
          </p>

          {card.oracle_text && (
            <div
              style={{
                padding: 12,
                background: T.bg,
                borderRadius: 8,
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {card.oracle_text}
            </div>
          )}

          {card.flavor_text && (
            <div
              style={{
                fontSize: 13,
                fontStyle: "italic",
                color: T.textMuted,
                marginBottom: 12,
                lineHeight: 1.5,
              }}
            >
              {card.flavor_text}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {card.power != null && (
              <Tag>
                P/T: {card.power}/{card.toughness}
              </Tag>
            )}
            {card.loyalty != null && <Tag>Loyalty: {card.loyalty}</Tag>}
            <Tag>{card.set_name}</Tag>
            <Tag
              color={
                card.rarity === "mythic" || card.rarity === "rare" ? "gold" : undefined
              }
            >
              {card.rarity}
            </Tag>
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 14 }}>
            <div>
              <span style={{ color: T.textMuted }}>USD: </span>
              <span style={{ color: T.success, fontWeight: 600 }}>
                {fmtPrice(card.prices?.usd)}
              </span>
            </div>
            <div>
              <span style={{ color: T.textMuted }}>Foil: </span>
              <span style={{ color: T.accent, fontWeight: 600 }}>
                {fmtPrice(card.prices?.usd_foil)}
              </span>
            </div>
          </div>

          {card.legalities && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 6 }}>
                Legality
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {LEGALITY_FORMATS.map((f) => (
                  <Tag
                    key={f}
                    color={
                      card.legalities![f] === "legal"
                        ? "green"
                        : card.legalities![f] === "banned"
                          ? "red"
                          : undefined
                    }
                  >
                    {f}: {card.legalities![f]}
                  </Tag>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn variant="accent" onClick={() => onAddDeck(card)}>
              + Deck
            </Btn>
            <Btn onClick={() => onAddCollection(card)}>+ Collection</Btn>
            {card.scryfall_uri && (
              <a
                href={card.scryfall_uri}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Btn>Scryfall ↗</Btn>
              </a>
            )}
            {card.purchase_uris?.tcgplayer && (
              <a
                href={card.purchase_uris.tcgplayer}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <Btn>TCGplayer ↗</Btn>
              </a>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "none",
            border: "none",
            color: T.textMuted,
            fontSize: 24,
            cursor: "pointer",
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
});
