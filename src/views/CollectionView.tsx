import { T } from "../constants";
import { fmtPrice } from "../helpers";
import { CardRow } from "../components";
import type { DeckCard, ScryfallCard } from "../types";

interface CollectionViewProps {
  collection: DeckCard[];
  onCardClick: (card: ScryfallCard) => void;
  addToCollection: (card: ScryfallCard) => void;
  removeFromCollection: (cardId: string) => void;
}

export function CollectionView({
  collection,
  onCardClick,
  addToCollection,
  removeFromCollection,
}: CollectionViewProps) {
  const totalValue = collection.reduce(
    (s, c) => s + parseFloat(c.prices?.usd ?? "0") * c.qty,
    0,
  );
  const totalCards = collection.reduce((s, c) => s + c.qty, 0);

  const sorted = [...collection].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
          alignItems: "baseline",
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: 20 }}>
          Collection
        </h2>
        <span style={{ fontSize: 14, color: T.textMuted }}>{totalCards} cards</span>
        <span style={{ fontSize: 14, color: T.success, fontWeight: 600 }}>
          {fmtPrice(totalValue.toString())}
        </span>
      </div>

      {!collection.length ? (
        <div style={{ textAlign: "center", padding: 48, color: T.textDim }}>
          Search for cards and add them to your collection.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sorted.map((c) => (
            <CardRow
              key={c.id}
              card={c}
              onClick={onCardClick}
              onAdd={addToCollection}
              onRemove={removeFromCollection}
              showSet
            />
          ))}
        </div>
      )}
    </div>
  );
}
