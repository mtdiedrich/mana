import { useState, useCallback, useEffect, useRef } from "react";
import type { ScryfallCard } from "../types";
import type { SearchFilters } from "../scryfall";
import { searchCards, autocomplete, buildQuery } from "../scryfall";
import { useDebounce } from "./useDebounce";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ScryfallCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Autocomplete
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filters
  const [colorFilters, setColorFilters] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [mvFilter, setMvFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");

  const filters: SearchFilters = {
    colors: colorFilters.length ? colorFilters : undefined,
    type: typeFilter || undefined,
    mv: mvFilter || undefined,
    rarity: rarityFilter || undefined,
  };

  const doSearch = useCallback(
    async (text: string, p = 1) => {
      const q = buildQuery(text, filters);
      if (!q.trim() || q.trim().length < 2) return;
      setLoading(true);
      setError(null);
      try {
        const data = await searchCards(q, p);
        const cards = data?.data ?? [];
        if (p === 1) setResults(cards);
        else setResults((prev) => [...prev, ...cards]);
        setTotal(data?.total_cards ?? 0);
        setHasMore(data?.has_more ?? false);
        setPage(p);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorFilters, typeFilter, mvFilter, rarityFilter],
  );

  const debouncedAutocomplete = useDebounce(async (q: string) => {
    if (!q || q.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const items = await autocomplete(q);
      setSuggestions(items);
      setShowSuggestions(items.length > 0);
    } catch {
      setSuggestions([]);
    }
  }, 300);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleColor = useCallback((color: string) => {
    setColorFilters((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setColorFilters([]);
    setTypeFilter("");
    setMvFilter("");
    setRarityFilter("");
  }, []);

  const hasFilters =
    colorFilters.length > 0 || !!typeFilter || !!mvFilter || !!rarityFilter;

  return {
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
  };
}
