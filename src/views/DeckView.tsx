import { useState, useMemo } from "react";
import { T, FORMATS } from "../constants";
import { capitalize, fmtPrice } from "../helpers";
import { computeDeckStats } from "../stats";
import { sortDeckCards } from "../deck";
import {
  Btn,
  CardGridItem,
  CardRow,
  ManaCurveChart,
  ColorDist,
  Tag,
} from "../components";
import { inputStyle, selectStyle, gridStyle, navBtnStyle } from "../components/styles";
import type { Deck, ScryfallCard, SortKey } from "../types";

interface DeckViewProps {
  decks: Deck[];
  activeDeck: Deck;
  activeDeckId: string;
  setActiveDeckId: (id: string) => void;
  addToDeck: (card: ScryfallCard) => void;
  removeFromDeck: (cardId: string) => void;
  createDeck: (name: string, format: string) => void;
  deleteActiveDeck: () => void;
  importCards: (text: string) => Promise<void>;
  exportCards: () => void;
  onCardClick: (card: ScryfallCard) => void;
}

export function DeckView({
  decks,
  activeDeck,
  activeDeckId,
  setActiveDeckId,
  addToDeck,
  removeFromDeck,
  createDeck,
  deleteActiveDeck,
  importCards,
  exportCards,
  onCardClick,
}: DeckViewProps) {
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [deckViewMode, setDeckViewMode] = useState<"list" | "grid">("list");
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [newDeckName, setNewDeckName] = useState("");
  const [newDeckFormat, setNewDeckFormat] = useState("commander");
  const [importText, setImportText] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const stats = useMemo(() => computeDeckStats(activeDeck.cards), [activeDeck.cards]);
  const sorted = useMemo(() => sortDeckCards(activeDeck.cards, sortBy), [activeDeck.cards, sortBy]);

  const handleCreateDeck = () => {
    createDeck(newDeckName, newDeckFormat);
    setNewDeckName("");
    setShowNewDeck(false);
  };

  const handleImport = async () => {
    if (!importText.trim()) return;
    setImportLoading(true);
    await importCards(importText);
    setImportLoading(false);
    setShowImport(false);
    setImportText("");
  };

  return (
    <div>
      {/* Deck Selector */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <select
          style={{ ...selectStyle, fontSize: 15, padding: "8px 12px" }}
          value={activeDeckId}
          onChange={(e) => setActiveDeckId(e.target.value)}
        >
          {decks.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.cards.reduce((s, c) => s + c.qty, 0)})
            </option>
          ))}
        </select>
        <Btn variant="accent" onClick={() => setShowNewDeck(true)}>
          + New
        </Btn>
        <Btn onClick={() => setShowImport(true)}>Import</Btn>
        <Btn onClick={exportCards}>Export</Btn>
        {decks.length > 1 && (
          <Btn variant="danger" onClick={deleteActiveDeck}>
            Delete
          </Btn>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: T.textMuted }}>{activeDeck.format}</span>
      </div>

      {/* Stats Dashboard */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: T.surface,
            borderRadius: 8,
            padding: 16,
            border: `1px solid ${T.border}`,
          }}
        >
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Cards</div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Cinzel', serif" }}>
            {stats.totalCards}
          </div>
          <div style={{ fontSize: 12, color: T.textDim }}>{stats.landCount} lands</div>
        </div>
        <div
          style={{
            background: T.surface,
            borderRadius: 8,
            padding: 16,
            border: `1px solid ${T.border}`,
          }}
        >
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 4 }}>Value</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontFamily: "'Cinzel', serif",
              color: T.success,
            }}
          >
            {fmtPrice(stats.totalValue.toString())}
          </div>
        </div>
        <div
          style={{
            background: T.surface,
            borderRadius: 8,
            padding: 16,
            border: `1px solid ${T.border}`,
          }}
        >
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
            Mana Curve
          </div>
          <ManaCurveChart curve={stats.manaCurve} />
        </div>
        <div
          style={{
            background: T.surface,
            borderRadius: 8,
            padding: 16,
            border: `1px solid ${T.border}`,
          }}
        >
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>Colors</div>
          <ColorDist dist={stats.colorDistribution} />
          <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(stats.typeBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([t, n]) => (
                <Tag key={t}>
                  {t}: {n}
                </Tag>
              ))}
          </div>
        </div>
      </div>

      {/* Sort / View Toggle */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, color: T.textMuted }}>Sort:</span>
        {(["name", "cmc", "type", "color", "price"] as const).map((o) => (
          <button key={o} style={navBtnStyle(sortBy === o)} onClick={() => setSortBy(o)}>
            {o === "cmc" ? "MV" : capitalize(o)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {(["list", "grid"] as const).map((m) => (
          <button
            key={m}
            style={navBtnStyle(deckViewMode === m)}
            onClick={() => setDeckViewMode(m)}
          >
            {capitalize(m)}
          </button>
        ))}
      </div>

      {/* Card List */}
      {!activeDeck.cards.length ? (
        <div style={{ textAlign: "center", padding: 48, color: T.textDim }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Deck is empty</p>
          <p style={{ fontSize: 13 }}>Search for cards, or import a decklist.</p>
        </div>
      ) : deckViewMode === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {sorted.map((c) => (
            <CardRow
              key={c.id}
              card={c}
              onClick={onCardClick}
              onAdd={addToDeck}
              onRemove={removeFromDeck}
            />
          ))}
        </div>
      ) : (
        <div style={gridStyle}>
          {sorted.map((c) => (
            <div key={c.id} style={{ position: "relative" }}>
              <CardGridItem card={c} onClick={onCardClick} />
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  background: "rgba(0,0,0,0.75)",
                  color: T.accent,
                  borderRadius: 6,
                  padding: "2px 8px",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {c.qty}×
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Deck Modal */}
      {showNewDeck && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowNewDeck(false)}
        >
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 400,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", fontFamily: "'Cinzel', serif" }}>
              New Deck
            </h3>
            <input
              style={{ ...inputStyle, marginBottom: 12 }}
              placeholder="Deck name"
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateDeck()}
              autoFocus
            />
            <select
              style={{ ...selectStyle, width: "100%", marginBottom: 16, padding: "10px 12px" }}
              value={newDeckFormat}
              onChange={(e) => setNewDeckFormat(e.target.value)}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {capitalize(f)}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn onClick={() => setShowNewDeck(false)}>Cancel</Btn>
              <Btn variant="accent" onClick={handleCreateDeck}>
                Create
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowImport(false)}
        >
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: 24,
              maxWidth: 600,
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 8px", fontFamily: "'Cinzel', serif" }}>
              Import Decklist
            </h3>
            <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>
              One card per line: &quot;4 Lightning Bolt&quot; or &quot;4x Lightning Bolt&quot;
            </p>
            <textarea
              style={{
                ...inputStyle,
                minHeight: 200,
                resize: "vertical",
                fontFamily: "monospace",
                fontSize: 13,
              }}
              placeholder={"4 Lightning Bolt\n4 Counterspell\n1 Sol Ring"}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
              <Btn onClick={() => setShowImport(false)}>Cancel</Btn>
              <Btn variant="accent" onClick={handleImport} disabled={importLoading}>
                {importLoading ? "Importing..." : "Import"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
