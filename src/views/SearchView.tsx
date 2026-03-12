import { COLORS, CARD_TYPES, RARITIES, T } from "../constants";
import { capitalize } from "../helpers";
import { Btn, CardGridItem } from "../components";
import { inputStyle, selectStyle, gridStyle } from "../components/styles";
import type { DeckCard, ScryfallCard } from "../types";

interface SearchViewProps {
  query: string;
  setQuery: (q: string) => void;
  results: ScryfallCard[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  page: number;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (v: boolean) => void;
  suggestionsRef: React.RefObject<HTMLDivElement | null>;
  colorFilters: string[];
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  mvFilter: string;
  setMvFilter: (v: string) => void;
  rarityFilter: string;
  setRarityFilter: (v: string) => void;
  toggleColor: (c: string) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  doSearch: (text: string, page?: number) => void;
  debouncedAutocomplete: (q: string) => void;
  onCardClick: (card: ScryfallCard) => void;
  collection: DeckCard[];
  addToCollection: (card: ScryfallCard) => void;
  removeFromCollection: (cardId: string) => void;
}

export function SearchView({
  query,
  setQuery,
  results,
  loading,
  error,
  total,
  hasMore,
  page,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  suggestionsRef,
  colorFilters,
  typeFilter,
  setTypeFilter,
  mvFilter,
  setMvFilter,
  rarityFilter,
  setRarityFilter,
  toggleColor,
  clearFilters,
  hasFilters,
  doSearch,
  debouncedAutocomplete,
  onCardClick,
  collection,
  addToCollection,
  removeFromCollection,
}: SearchViewProps) {
  return (
    <div>
      {/* Search Input */}
      <div style={{ position: "relative", marginBottom: 16 }} ref={suggestionsRef}>
        <input
          style={inputStyle}
          placeholder="Search cards... (e.g. 'lightning bolt', 'o:draw t:instant c:blue')"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            debouncedAutocomplete(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setShowSuggestions(false);
              doSearch(query, 1);
            }
          }}
          onFocus={() => {
            if (suggestions.length) setShowSuggestions(true);
          }}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              marginTop: 4,
              zIndex: 100,
              maxHeight: 260,
              overflowY: "auto",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {suggestions.map((name, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontSize: 14,
                  borderBottom: `1px solid ${T.border}`,
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setQuery(name);
                  setShowSuggestions(false);
                  setTimeout(() => doSearch(name, 1), 10);
                }}
              >
                {name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        {Object.entries(COLORS).map(([k, c]) => {
          const active = colorFilters.includes(k.toLowerCase());
          return (
            <button
              key={k}
              onClick={() => toggleColor(k.toLowerCase())}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: active ? c.bg : T.surface,
                color: active ? c.fg : T.textMuted,
                border: `2px solid ${active ? c.border : T.border}`,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: active ? 1 : 0.6,
              }}
            >
              {k}
            </button>
          );
        })}
        <select
          style={selectStyle}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">Any type</option>
          {CARD_TYPES.map((t) => (
            <option key={t} value={t}>
              {capitalize(t)}
            </option>
          ))}
        </select>
        <select
          style={selectStyle}
          value={mvFilter}
          onChange={(e) => setMvFilter(e.target.value)}
        >
          <option value="">Any MV</option>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
            <option key={n} value={n}>
              {n}
              {n === 7 ? "+" : ""}
            </option>
          ))}
        </select>
        <select
          style={selectStyle}
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
        >
          <option value="">Any rarity</option>
          {RARITIES.map((r) => (
            <option key={r} value={r}>
              {capitalize(r)}
            </option>
          ))}
        </select>
        <Btn variant="accent" onClick={() => doSearch(query, 1)}>
          Search
        </Btn>
        {hasFilters && <Btn onClick={clearFilters}>Clear</Btn>}
      </div>

      {/* Results */}
      {error && (
        <p style={{ color: T.danger, fontSize: 14, marginBottom: 12 }}>
          Error: {error}
        </p>
      )}
      {total > 0 && (
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>
          {total} cards found
        </p>
      )}

      <div style={gridStyle}>
        {results.map((c) => (
          <CardGridItem
            key={c.id}
            card={c}
            onClick={onCardClick}
            collectionQty={collection.find((x) => x.id === c.id)?.qty ?? 0}
            onAdd={addToCollection}
            onRemove={removeFromCollection}
          />
        ))}
      </div>

      {loading && (
        <p style={{ textAlign: "center", color: T.textMuted, padding: 32 }}>
          Searching...
        </p>
      )}
      {!loading && !results.length && query.length >= 2 && !error && (
        <p style={{ textAlign: "center", color: T.textDim, padding: 32 }}>
          No results.
        </p>
      )}
      {hasMore && !loading && (
        <div style={{ textAlign: "center", padding: 16 }}>
          <Btn onClick={() => doSearch(query, page + 1)}>Load more</Btn>
        </div>
      )}
    </div>
  );
}
