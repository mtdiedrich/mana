import { useState } from "react";
import { T } from "./constants";
import { CardDetailModal } from "./components";
import { navBtnStyle } from "./components/styles";
import { useSearch } from "./hooks/useSearch";
import { useDeckManager } from "./hooks/useDeckManager";
import { useCollection } from "./hooks/useCollection";
import { SearchView } from "./views/SearchView";
import { DeckView } from "./views/DeckView";
import { CollectionView } from "./views/CollectionView";
import type { ScryfallCard, ViewName } from "./types";

export default function App() {
  const [view, setView] = useState<ViewName>("search");
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  const search = useSearch();
  const deckManager = useDeckManager();
  const { collection, addToCollection, removeFromCollection } = useCollection();

  const views: [ViewName, string][] = [
    ["search", "Search"],
    ["deck", "Decks"],
    ["collection", "Collection"],
  ];

  return (
    <div
      style={{
        fontFamily: "'Crimson Pro', Georgia, serif",
        background: T.bg,
        color: T.text,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 20,
            fontWeight: 700,
            color: T.accent,
            letterSpacing: "0.05em",
          }}
        >
          GRIMOIRE
        </span>
        <nav style={{ display: "flex", gap: 2 }}>
          {views.map(([v, label]) => (
            <button key={v} style={navBtnStyle(view === v)} onClick={() => setView(v)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: "16px 20px",
          boxSizing: "border-box",
        }}
      >
        {view === "search" && (
          <SearchView {...search} onCardClick={setSelectedCard} />
        )}
        {view === "deck" && (
          <DeckView {...deckManager} onCardClick={setSelectedCard} />
        )}
        {view === "collection" && (
          <CollectionView
            collection={collection}
            onCardClick={setSelectedCard}
            addToCollection={addToCollection}
            removeFromCollection={removeFromCollection}
          />
        )}
      </main>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAddDeck={deckManager.addToDeck}
          onAddCollection={addToCollection}
        />
      )}
    </div>
  );
}
