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
import { LoginView } from "./views/LoginView";
import { useAuth } from "./AuthContext";
import type { ScryfallCard, ViewName } from "./types";

export default function App() {
  const { user, logout } = useAuth();
  const [view, setView] = useState<ViewName>("search");
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null);

  const search = useSearch();
  const userId = user?.id ?? "";
  const deckManager = useDeckManager(userId);
  const { collection, addToCollection, removeFromCollection } = useCollection(userId);

  if (!user) {
    return (
      <div
        style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          background: T.bg,
          color: T.text,
          minHeight: "100vh",
        }}
      >
        <LoginView />
      </div>
    );
  }

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
          padding: "10px clamp(10px, 3vw, 20px)",
          borderBottom: `1px solid ${T.border}`,
          background: T.surface,
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(16px, 4vw, 20px)",
            fontWeight: 700,
            color: T.accent,
            letterSpacing: "0.05em",
          }}
        >
          GRIMOIRE
        </span>
        <nav style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          {views.map(([v, label]) => (
            <button key={v} style={navBtnStyle(view === v)} onClick={() => setView(v)}>
              {label}
            </button>
          ))}
          <span style={{ color: T.textMuted, fontSize: 13, marginLeft: 12 }}>
            {user.displayName}
          </span>
          <button
            onClick={logout}
            style={{
              marginLeft: 8,
              padding: "6px 12px",
              background: "transparent",
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              color: T.textMuted,
              fontSize: 12,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          padding: "12px clamp(10px, 3vw, 20px)",
          boxSizing: "border-box",
        }}
      >
        {view === "search" && (
          <SearchView
            {...search}
            onCardClick={setSelectedCard}
            collection={collection}
            addToCollection={addToCollection}
            removeFromCollection={removeFromCollection}
          />
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
