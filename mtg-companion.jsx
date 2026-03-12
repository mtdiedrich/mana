import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";

// ─── Constants ───
const COLORS = {
  W: { bg: "#F9FAF4", fg: "#33302D", border: "#D4C5A9" },
  U: { bg: "#0E68AB", fg: "#FFF", border: "#0A4F82" },
  B: { bg: "#150B00", fg: "#AD9F93", border: "#3D2B1F" },
  R: { bg: "#D3202A", fg: "#FFF", border: "#A01820" },
  G: { bg: "#00733E", fg: "#FFF", border: "#005A2F" },
  C: { bg: "#CBB5A0", fg: "#33302D", border: "#A89780" },
};

const GENERIC_MANA_BG = "#CBC2BF";
const GENERIC_MANA_FG = "#33302D";

const T = {
  bg: "#0D0F0E", surface: "#161A18", surfaceHover: "#1C211F",
  card: "#1A1F1D", border: "#2A302D",
  text: "#E8EBE9", textMuted: "#8A938E", textDim: "#5A635E",
  accent: "#C9A227", accentDim: "rgba(201,162,39,0.15)", accentHover: "#D4AF37",
  danger: "#C44536", dangerDim: "rgba(196,69,54,0.15)",
  success: "#4A9B6E", successDim: "rgba(74,155,110,0.15)",
};

const FORMATS = ["commander","standard","modern","pioneer","legacy","vintage","pauper","casual"];
const TYPES = ["creature","instant","sorcery","enchantment","artifact","planeswalker","land"];
const RARITIES = ["common","uncommon","rare","mythic"];
const LEG_FMTS = ["standard","pioneer","modern","legacy","commander","pauper"];

// ─── Helpers ───
const fmtPrice = (p) => p ? `$${parseFloat(p).toFixed(2)}` : "—";
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const cardImg = (c, sz = "small") => c?.image_uris?.[sz] || c?.card_faces?.[0]?.image_uris?.[sz] || null;

// ─── Scryfall ───
async function scry(path) {
  const r = await fetch(`https://api.scryfall.com${path}`);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Scryfall error ${r.status}`);
  return r.json();
}

// ─── Stable debounce hook ───
function useDebounce(fn, ms) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const timer = useRef(null);
  return useCallback((...a) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...a), ms);
  }, [ms]);
}

// ─── Small Components ───
const ManaSymbol = memo(({ symbol, size = 16 }) => {
  const c = COLORS[symbol];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      backgroundColor: c ? c.bg : GENERIC_MANA_BG,
      color: c ? c.fg : GENERIC_MANA_FG,
      fontSize: size * 0.6, fontWeight: 700, lineHeight: 1,
      border: "1px solid rgba(0,0,0,0.25)", flexShrink: 0,
      boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.2)",
    }}>{symbol}</span>
  );
});

const ManaCost = memo(({ cost, size = 16 }) => {
  if (!cost) return null;
  const syms = cost.match(/\{([^}]+)\}/g) || [];
  return (
    <span style={{ display: "inline-flex", gap: 2, alignItems: "center" }}>
      {syms.map((s, i) => <ManaSymbol key={i} symbol={s.replace(/[{}]/g, "").replace("/","")} size={size} />)}
    </span>
  );
});

const Tag = ({ children, color }) => {
  const map = { gold: [T.accentDim, T.accent], green: [T.successDim, T.success], red: [T.dangerDim, T.danger] };
  const [bg, fg] = map[color] || [T.border, T.textMuted];
  return <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:600, background:bg, color:fg }}>{children}</span>;
};

const Btn = ({ children, variant="default", style:xs, ...p }) => {
  const base = variant==="accent" ? {background:T.accent,color:"#000",border:"none"}
    : variant==="danger" ? {background:T.danger,color:"#FFF",border:"none"}
    : {background:T.surface,color:T.text,border:`1px solid ${T.border}`};
  return <button style={{ padding:"6px 12px", borderRadius:6, cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:500, display:"inline-flex", alignItems:"center", gap:6, ...base, ...xs }} {...p}>{children}</button>;
};

const CardGridItem = memo(({ card, onClick }) => {
  const img = cardImg(card);
  const [h, setH] = useState(false);
  return (
    <div onClick={() => onClick(card)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position:"relative", borderRadius:10, overflow:"hidden", cursor:"pointer",
        aspectRatio:"488/680", background:T.card,
        transform: h ? "scale(1.03)" : "scale(1)",
        boxShadow: h ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}>
      {img
        ? <img src={img} alt={card.name} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        : <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100%", padding:16, textAlign:"center", fontSize:14, color:T.textMuted }}>{card.name}</div>
      }
    </div>
  );
});

const CardRow = memo(({ card, onClick, onAdd, onRemove, showSet }) => {
  const img = cardImg(card);
  const [h, setH] = useState(false);
  return (
    <div onClick={() => onClick(card)} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 10px", borderRadius:6, cursor:"pointer", background: h ? T.surfaceHover : T.surface, transition:"background 0.1s" }}>
      <span style={{ fontSize:14, fontWeight:600, color:T.accent, minWidth:20 }}>{card.qty}×</span>
      {img && <img src={img} alt="" style={{ width:28, height:40, borderRadius:3, objectFit:"cover" }} />}
      <span style={{ flex:1, fontSize:14 }}>{card.name}</span>
      <ManaCost cost={card.mana_cost} size={14} />
      {showSet && <span style={{ fontSize:12, color:T.textDim, minWidth:80 }}>{card.set_name}</span>}
      <span style={{ fontSize:12, color:T.textMuted, minWidth:50, textAlign:"right" }}>{fmtPrice(card.prices?.usd)}</span>
      <Btn style={{ padding:"4px 8px", fontSize:12 }} onClick={e => { e.stopPropagation(); onAdd(card); }}>+</Btn>
      <Btn style={{ padding:"4px 8px", fontSize:12 }} onClick={e => { e.stopPropagation(); onRemove(card.id); }}>−</Btn>
    </div>
  );
});

const ManaCurveChart = memo(({ curve }) => {
  const keys = ["0","1","2","3","4","5","6","7+"];
  const max = Math.max(...keys.map(k => curve[k]||0), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:120 }}>
      {keys.map(k => {
        const v = curve[k]||0;
        return (
          <div key={k} style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1 }}>
            <span style={{ fontSize:11, color:T.textMuted, marginBottom:4 }}>{v||""}</span>
            <div style={{ width:"100%", height:(v/max)*100, minHeight:v>0?4:0, background:`linear-gradient(to top, ${T.accent}, ${T.accentHover})`, borderRadius:"4px 4px 0 0", transition:"height 0.3s" }} />
            <span style={{ fontSize:12, color:T.textDim, marginTop:4 }}>{k}</span>
          </div>
        );
      })}
    </div>
  );
});

const ColorDist = memo(({ dist }) => {
  const tot = Object.values(dist).reduce((s,v) => s+v, 0) || 1;
  return (
    <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
      {Object.entries(dist).filter(([,v]) => v>0).map(([k,v]) => (
        <div key={k} style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ width:12, height:12, borderRadius:"50%", background:COLORS[k]?.bg||"#999", border:"1px solid rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize:12, color:T.textMuted }}>{k}: {v} ({Math.round(v/tot*100)}%)</span>
        </div>
      ))}
    </div>
  );
});

const CardDetailModal = memo(({ card, onClose, onAddDeck, onAddCollection }) => {
  const [showBack, setShowBack] = useState(false);
  if (!card) return null;
  const img = cardImg(card, "normal");
  const backImg = card.card_faces?.[1]?.image_uris?.normal;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:24, maxWidth:800, width:"90%", maxHeight:"90vh", overflowY:"auto", position:"relative", display:"flex", gap:24, flexWrap:"wrap" }} onClick={e => e.stopPropagation()}>
        <div style={{ flex:"0 0 280px", maxWidth:280 }}>
          <img src={showBack && backImg ? backImg : img} alt={card.name} style={{ width:"100%", borderRadius:10 }} />
          {backImg && <Btn style={{ marginTop:8, width:"100%", justifyContent:"center" }} onClick={() => setShowBack(!showBack)}>{showBack ? "Show Front" : "Show Back"}</Btn>}
        </div>
        <div style={{ flex:1, minWidth:220 }}>
          <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:8, flexWrap:"wrap" }}>
            <h2 style={{ margin:0, fontSize:22, fontFamily:"'Cinzel', serif" }}>{card.name}</h2>
            <ManaCost cost={card.mana_cost} size={18} />
          </div>
          <p style={{ color:T.textMuted, fontSize:14, margin:"4px 0 12px" }}>{card.type_line}</p>
          {card.oracle_text && <div style={{ padding:12, background:T.bg, borderRadius:8, fontSize:14, lineHeight:1.6, marginBottom:12, whiteSpace:"pre-wrap" }}>{card.oracle_text}</div>}
          {card.flavor_text && <div style={{ fontSize:13, fontStyle:"italic", color:T.textMuted, marginBottom:12, lineHeight:1.5 }}>{card.flavor_text}</div>}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
            {card.power != null && <Tag>P/T: {card.power}/{card.toughness}</Tag>}
            {card.loyalty != null && <Tag>Loyalty: {card.loyalty}</Tag>}
            <Tag>{card.set_name}</Tag>
            <Tag color={(card.rarity==="mythic"||card.rarity==="rare") ? "gold" : undefined}>{card.rarity}</Tag>
          </div>
          <div style={{ display:"flex", gap:16, marginBottom:16, fontSize:14 }}>
            <div><span style={{color:T.textMuted}}>USD: </span><span style={{color:T.success,fontWeight:600}}>{fmtPrice(card.prices?.usd)}</span></div>
            <div><span style={{color:T.textMuted}}>Foil: </span><span style={{color:T.accent,fontWeight:600}}>{fmtPrice(card.prices?.usd_foil)}</span></div>
          </div>
          {card.legalities && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, color:T.textMuted, marginBottom:6 }}>Legality</div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {LEG_FMTS.map(f => <Tag key={f} color={card.legalities[f]==="legal"?"green":card.legalities[f]==="banned"?"red":undefined}>{f}: {card.legalities[f]}</Tag>)}
              </div>
            </div>
          )}
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <Btn variant="accent" onClick={() => onAddDeck(card)}>+ Deck</Btn>
            <Btn onClick={() => onAddCollection(card)}>+ Collection</Btn>
            {card.scryfall_uri && <a href={card.scryfall_uri} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}><Btn>Scryfall ↗</Btn></a>}
            {card.purchase_uris?.tcgplayer && <a href={card.purchase_uris.tcgplayer} target="_blank" rel="noopener noreferrer" style={{textDecoration:"none"}}><Btn>TCGplayer ↗</Btn></a>}
          </div>
        </div>
        <button onClick={onClose} style={{ position:"absolute", top:12, right:16, background:"none", border:"none", color:T.textMuted, fontSize:24, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>
    </div>
  );
});

// ─── Shared Styles ───
const inputStyle = { width:"100%", padding:"12px 16px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.text, fontSize:15, fontFamily:"inherit", outline:"none", boxSizing:"border-box" };
const selectStyle = { padding:"6px 10px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:6, color:T.text, fontSize:13, fontFamily:"inherit", cursor:"pointer", outline:"none" };
const gridStyle = { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12 };
const navBtn = (on) => ({ padding:"8px 16px", background:on?T.accentDim:"transparent", color:on?T.accent:T.textMuted, border:"none", borderRadius:6, cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:on?600:400 });

// ═══════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════
export default function App() {
  const [view, setView] = useState("search");

  // Search
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [suggs, setSuggs] = useState([]);
  const [showSuggs, setShowSuggs] = useState(false);
  const [cFilt, setCFilt] = useState([]);
  const [tFilt, setTFilt] = useState("");
  const [mvFilt, setMvFilt] = useState("");
  const [rFilt, setRFilt] = useState("");

  // Data
  const [selectedCard, setSelectedCard] = useState(null);
  const [decks, setDecks] = useState([{ id:"default", name:"My Deck", cards:[], format:"commander" }]);
  const [deckId, setDeckId] = useState("default");
  const [collection, setCollection] = useState([]);
  const [sortBy, setSortBy] = useState("name");
  const [deckView, setDeckView] = useState("list");

  // Modals
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [ndName, setNdName] = useState("");
  const [ndFmt, setNdFmt] = useState("commander");
  const [impText, setImpText] = useState("");
  const [impLoading, setImpLoading] = useState(false);

  const sugRef = useRef(null);
  const deck = decks.find(d => d.id === deckId) || decks[0];

  // Persistence
  useEffect(() => {
    (async () => {
      try { const d = await window.storage?.get("mtg-decks"); if (d?.value) setDecks(JSON.parse(d.value)); } catch {}
      try { const c = await window.storage?.get("mtg-collection"); if (c?.value) setCollection(JSON.parse(c.value)); } catch {}
    })();
  }, []);
  useEffect(() => { try { window.storage?.set("mtg-decks", JSON.stringify(decks)); } catch {} }, [decks]);
  useEffect(() => { try { window.storage?.set("mtg-collection", JSON.stringify(collection)); } catch {} }, [collection]);

  // Build scryfall query
  const buildQ = useCallback((text) => {
    let q = text || "";
    if (cFilt.length) q += " " + cFilt.map(c => `c:${c}`).join("");
    if (tFilt) q += ` t:${tFilt}`;
    if (mvFilt) q += ` mv=${mvFilt}`;
    if (rFilt) q += ` r:${rFilt}`;
    return q;
  }, [cFilt, tFilt, mvFilt, rFilt]);

  // Search
  const doSearch = useCallback(async (text, p = 1) => {
    const q = buildQ(text);
    if (!q.trim() || q.trim().length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const data = await scry(`/cards/search?q=${encodeURIComponent(q)}&page=${p}&unique=cards`);
      const cards = data?.data || [];
      if (p === 1) setResults(cards); else setResults(prev => [...prev, ...cards]);
      setTotal(data?.total_cards || 0);
      setHasMore(data?.has_more || false);
      setPage(p);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [buildQ]);

  const debouncedAC = useDebounce(async (q) => {
    if (!q || q.length < 2) { setSuggs([]); return; }
    try {
      const d = await scry(`/cards/autocomplete?q=${encodeURIComponent(q)}`);
      const items = d?.data || [];
      setSuggs(items);
      setShowSuggs(items.length > 0);
    } catch { setSuggs([]); }
  }, 300);

  useEffect(() => {
    const handler = (e) => { if (sugRef.current && !sugRef.current.contains(e.target)) setShowSuggs(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Deck ops
  const addToDeck = useCallback((card) => {
    setDecks(prev => prev.map(d => {
      if (d.id !== deckId) return d;
      const ex = d.cards.find(c => c.id === card.id);
      if (ex) return { ...d, cards: d.cards.map(c => c.id === card.id ? {...c, qty:c.qty+1} : c) };
      return { ...d, cards: [...d.cards, {...card, qty:1}] };
    }));
  }, [deckId]);

  const removeFromDeck = useCallback((cardId) => {
    setDecks(prev => prev.map(d => {
      if (d.id !== deckId) return d;
      const c = d.cards.find(x => x.id === cardId);
      if (c?.qty > 1) return { ...d, cards: d.cards.map(x => x.id === cardId ? {...x, qty:x.qty-1} : x) };
      return { ...d, cards: d.cards.filter(x => x.id !== cardId) };
    }));
  }, [deckId]);

  const addToCollection = useCallback((card) => {
    setCollection(prev => {
      const ex = prev.find(c => c.id === card.id);
      if (ex) return prev.map(c => c.id === card.id ? {...c, qty:c.qty+1} : c);
      return [...prev, {...card, qty:1}];
    });
  }, []);

  const removeFromCollection = useCallback((cardId) => {
    setCollection(prev => {
      const c = prev.find(x => x.id === cardId);
      if (c?.qty > 1) return prev.map(x => x.id === cardId ? {...x, qty:x.qty-1} : x);
      return prev.filter(x => x.id !== cardId);
    });
  }, []);

  const createDeck = useCallback(() => {
    if (!ndName.trim()) return;
    const id = `deck-${Date.now()}`;
    setDecks(prev => [...prev, { id, name:ndName.trim(), cards:[], format:ndFmt }]);
    setDeckId(id); setNdName(""); setShowNewDeck(false);
  }, [ndName, ndFmt]);

  const deleteDeck = useCallback(() => {
    if (decks.length <= 1) return;
    setDecks(prev => {
      const next = prev.filter(d => d.id !== deckId);
      setDeckId(next[0].id);
      return next;
    });
  }, [deckId, decks.length]);

  const importDeck = useCallback(async () => {
    if (!impText.trim()) return;
    setImpLoading(true);
    const lines = impText.trim().split("\n").filter(l => l.trim() && !l.startsWith("//") && !l.startsWith("#"));
    const cards = [];
    for (const line of lines) {
      const m = line.match(/^(\d+)x?\s+(.+)$/i);
      const qty = m ? parseInt(m[1])||1 : 1;
      const name = m ? m[2].trim() : line.trim();
      try {
        const card = await scry(`/cards/named?fuzzy=${encodeURIComponent(name)}`);
        if (card) cards.push({...card, qty});
        await new Promise(r => setTimeout(r, 80));
      } catch {}
    }
    if (cards.length) {
      setDecks(prev => prev.map(d => {
        if (d.id !== deckId) return d;
        const merged = [...d.cards];
        for (const c of cards) {
          const ex = merged.find(x => x.id === c.id);
          if (ex) ex.qty += c.qty; else merged.push(c);
        }
        return { ...d, cards: merged };
      }));
    }
    setImpLoading(false); setShowImport(false); setImpText("");
  }, [impText, deckId]);

  const exportDeck = useCallback(() => {
    navigator.clipboard?.writeText(deck.cards.map(c => `${c.qty} ${c.name}`).join("\n"));
  }, [deck]);

  // Stats
  const stats = useMemo(() => {
    const cs = deck?.cards || [];
    const tot = cs.reduce((s,c) => s+c.qty, 0);
    const val = cs.reduce((s,c) => s+(parseFloat(c.prices?.usd||0)*c.qty), 0);
    const curve = {};
    cs.forEach(c => {
      if (c.type_line?.includes("Land")) return;
      const k = (c.cmc||0) >= 7 ? "7+" : String(Math.floor(c.cmc||0));
      curve[k] = (curve[k]||0) + c.qty;
    });
    const cd = { W:0, U:0, B:0, R:0, G:0, C:0 };
    cs.forEach(c => { const ci = c.color_identity||[]; if (!ci.length) cd.C += c.qty; else ci.forEach(x => { if (cd[x]!==undefined) cd[x]+=c.qty; }); });
    const types = {};
    cs.forEach(c => { const t = (c.type_line||"").split("—")[0].trim().split(" ").pop(); types[t]=(types[t]||0)+c.qty; });
    const lands = cs.filter(c => c.type_line?.includes("Land")).reduce((s,c) => s+c.qty, 0);
    return { tot, val, curve, cd, types, lands };
  }, [deck]);

  const sorted = useMemo(() => {
    const cs = [...(deck?.cards||[])];
    const fn = { name:(a,b)=>a.name.localeCompare(b.name), cmc:(a,b)=>(a.cmc||0)-(b.cmc||0), type:(a,b)=>(a.type_line||"").localeCompare(b.type_line||""), price:(a,b)=>parseFloat(b.prices?.usd||0)-parseFloat(a.prices?.usd||0), color:(a,b)=>(a.color_identity||[]).join("").localeCompare((b.color_identity||[]).join("")) };
    return cs.sort(fn[sortBy]||fn.name);
  }, [deck, sortBy]);

  return (
    <div style={{ fontFamily:"'Crimson Pro', Georgia, serif", background:T.bg, color:T.text, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,400&display=swap" rel="stylesheet" />

      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderBottom:`1px solid ${T.border}`, background:T.surface }}>
        <span style={{ fontFamily:"'Cinzel', serif", fontSize:20, fontWeight:700, color:T.accent, letterSpacing:"0.05em" }}>GRIMOIRE</span>
        <nav style={{ display:"flex", gap:2 }}>
          {[["search","Search"],["deck","Decks"],["collection","Collection"]].map(([v,l]) =>
            <button key={v} style={navBtn(view===v)} onClick={() => setView(v)}>{l}</button>
          )}
        </nav>
      </header>

      <main style={{ flex:1, maxWidth:1200, width:"100%", margin:"0 auto", padding:"16px 20px", boxSizing:"border-box" }}>

        {/* ═══ SEARCH ═══ */}
        <div style={{ display: view==="search" ? "block" : "none" }}>
          <div style={{ position:"relative", marginBottom:16 }} ref={sugRef}>
            <input
              style={inputStyle}
              placeholder="Search cards... (e.g. 'lightning bolt', 'o:draw t:instant c:blue')"
              value={query}
              onChange={e => { setQuery(e.target.value); debouncedAC(e.target.value); }}
              onKeyDown={e => { if (e.key === "Enter") { setShowSuggs(false); doSearch(query, 1); } }}
              onFocus={() => { if (suggs.length) setShowSuggs(true); }}
            />
            {showSuggs && suggs.length > 0 && (
              <div style={{ position:"absolute", top:"100%", left:0, right:0, background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, marginTop:4, zIndex:100, maxHeight:260, overflowY:"auto", boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
                {suggs.map((name, i) => (
                  <div key={i} style={{ padding:"10px 16px", cursor:"pointer", fontSize:14, borderBottom:`1px solid ${T.border}` }}
                    onMouseDown={e => {
                      e.preventDefault();
                      setQuery(name);
                      setShowSuggs(false);
                      // Use setTimeout so state settles before search
                      setTimeout(() => doSearch(name, 1), 10);
                    }}>
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:16 }}>
            {Object.entries(COLORS).map(([k, c]) => {
              const active = cFilt.includes(k.toLowerCase());
              return (
                <button key={k} onClick={() => setCFilt(prev => active ? prev.filter(x=>x!==k.toLowerCase()) : [...prev, k.toLowerCase()])}
                  style={{ width:32, height:32, borderRadius:"50%", background:active?c.bg:T.surface, color:active?c.fg:T.textMuted, border:`2px solid ${active?c.border:T.border}`, cursor:"pointer", fontWeight:700, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", opacity:active?1:0.6 }}>
                  {k}
                </button>
              );
            })}
            <select style={selectStyle} value={tFilt} onChange={e => setTFilt(e.target.value)}>
              <option value="">Any type</option>
              {TYPES.map(t => <option key={t} value={t}>{cap(t)}</option>)}
            </select>
            <select style={selectStyle} value={mvFilt} onChange={e => setMvFilt(e.target.value)}>
              <option value="">Any MV</option>
              {[0,1,2,3,4,5,6,7].map(n => <option key={n} value={n}>{n}{n===7?"+":""}</option>)}
            </select>
            <select style={selectStyle} value={rFilt} onChange={e => setRFilt(e.target.value)}>
              <option value="">Any rarity</option>
              {RARITIES.map(r => <option key={r} value={r}>{cap(r)}</option>)}
            </select>
            <Btn variant="accent" onClick={() => doSearch(query, 1)}>Search</Btn>
            {(cFilt.length||tFilt||mvFilt||rFilt) && <Btn onClick={() => { setCFilt([]); setTFilt(""); setMvFilt(""); setRFilt(""); }}>Clear</Btn>}
          </div>

          {error && <p style={{ color:T.danger, fontSize:14, marginBottom:12 }}>Error: {error}</p>}
          {total > 0 && <p style={{ fontSize:13, color:T.textMuted, marginBottom:12 }}>{total} cards found</p>}

          <div style={gridStyle}>
            {results.map(c => <CardGridItem key={c.id} card={c} onClick={setSelectedCard} />)}
          </div>

          {loading && <p style={{ textAlign:"center", color:T.textMuted, padding:32 }}>Searching...</p>}
          {!loading && !results.length && query.length >= 2 && !error && <p style={{ textAlign:"center", color:T.textDim, padding:32 }}>No results.</p>}
          {hasMore && !loading && <div style={{ textAlign:"center", padding:16 }}><Btn onClick={() => doSearch(query, page+1)}>Load more</Btn></div>}
        </div>

        {/* ═══ DECKS ═══ */}
        <div style={{ display: view==="deck" ? "block" : "none" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
            <select style={{ ...selectStyle, fontSize:15, padding:"8px 12px" }} value={deckId} onChange={e => setDeckId(e.target.value)}>
              {decks.map(d => <option key={d.id} value={d.id}>{d.name} ({d.cards.reduce((s,c)=>s+c.qty,0)})</option>)}
            </select>
            <Btn variant="accent" onClick={() => setShowNewDeck(true)}>+ New</Btn>
            <Btn onClick={() => setShowImport(true)}>Import</Btn>
            <Btn onClick={exportDeck}>Export</Btn>
            {decks.length > 1 && <Btn variant="danger" onClick={deleteDeck}>Delete</Btn>}
            <div style={{ flex:1 }} />
            <span style={{ fontSize:13, color:T.textMuted }}>{deck.format}</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:12, marginBottom:16 }}>
            <div style={{ background:T.surface, borderRadius:8, padding:16, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:4 }}>Cards</div>
              <div style={{ fontSize:24, fontWeight:700, fontFamily:"'Cinzel', serif" }}>{stats.tot}</div>
              <div style={{ fontSize:12, color:T.textDim }}>{stats.lands} lands</div>
            </div>
            <div style={{ background:T.surface, borderRadius:8, padding:16, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:4 }}>Value</div>
              <div style={{ fontSize:24, fontWeight:700, fontFamily:"'Cinzel', serif", color:T.success }}>{fmtPrice(stats.val)}</div>
            </div>
            <div style={{ background:T.surface, borderRadius:8, padding:16, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:8 }}>Mana Curve</div>
              <ManaCurveChart curve={stats.curve} />
            </div>
            <div style={{ background:T.surface, borderRadius:8, padding:16, border:`1px solid ${T.border}` }}>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:8 }}>Colors</div>
              <ColorDist dist={stats.cd} />
              <div style={{ marginTop:8, display:"flex", gap:4, flexWrap:"wrap" }}>
                {Object.entries(stats.types).sort((a,b) => b[1]-a[1]).map(([t,n]) => <Tag key={t}>{t}: {n}</Tag>)}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:T.textMuted }}>Sort:</span>
            {["name","cmc","type","color","price"].map(o =>
              <button key={o} style={navBtn(sortBy===o)} onClick={() => setSortBy(o)}>{o==="cmc"?"MV":cap(o)}</button>
            )}
            <div style={{ flex:1 }} />
            {["list","grid"].map(m => <button key={m} style={navBtn(deckView===m)} onClick={() => setDeckView(m)}>{cap(m)}</button>)}
          </div>

          {!deck.cards.length ? (
            <div style={{ textAlign:"center", padding:48, color:T.textDim }}>
              <p style={{ fontSize:16, marginBottom:8 }}>Deck is empty</p>
              <p style={{ fontSize:13 }}>Search for cards, or import a decklist.</p>
            </div>
          ) : deckView === "list" ? (
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {sorted.map(c => <CardRow key={c.id} card={c} onClick={setSelectedCard} onAdd={addToDeck} onRemove={removeFromDeck} />)}
            </div>
          ) : (
            <div style={gridStyle}>
              {sorted.map(c => (
                <div key={c.id} style={{ position:"relative" }}>
                  <CardGridItem card={c} onClick={setSelectedCard} />
                  <div style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,0.75)", color:T.accent, borderRadius:6, padding:"2px 8px", fontSize:13, fontWeight:700 }}>{c.qty}×</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ COLLECTION ═══ */}
        <div style={{ display: view==="collection" ? "block" : "none" }}>
          {(() => {
            const tv = collection.reduce((s,c) => s+(parseFloat(c.prices?.usd||0)*c.qty), 0);
            const tc = collection.reduce((s,c) => s+c.qty, 0);
            return (
              <>
                <div style={{ display:"flex", gap:16, marginBottom:16, alignItems:"baseline" }}>
                  <h2 style={{ margin:0, fontFamily:"'Cinzel', serif", fontSize:20 }}>Collection</h2>
                  <span style={{ fontSize:14, color:T.textMuted }}>{tc} cards</span>
                  <span style={{ fontSize:14, color:T.success, fontWeight:600 }}>{fmtPrice(tv)}</span>
                </div>
                {!collection.length ? (
                  <div style={{ textAlign:"center", padding:48, color:T.textDim }}>Search for cards and add them to your collection.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                    {[...collection].sort((a,b) => a.name.localeCompare(b.name)).map(c =>
                      <CardRow key={c.id} card={c} onClick={setSelectedCard} onAdd={addToCollection} onRemove={removeFromCollection} showSet />
                    )}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </main>

      {selectedCard && <CardDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} onAddDeck={addToDeck} onAddCollection={addToCollection} />}

      {showNewDeck && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }} onClick={() => setShowNewDeck(false)}>
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:24, maxWidth:400, width:"90%" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 16px", fontFamily:"'Cinzel', serif" }}>New Deck</h3>
            <input style={{ ...inputStyle, marginBottom:12 }} placeholder="Deck name" value={ndName} onChange={e => setNdName(e.target.value)} onKeyDown={e => e.key==="Enter" && createDeck()} autoFocus />
            <select style={{ ...selectStyle, width:"100%", marginBottom:16, padding:"10px 12px" }} value={ndFmt} onChange={e => setNdFmt(e.target.value)}>
              {FORMATS.map(f => <option key={f} value={f}>{cap(f)}</option>)}
            </select>
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
              <Btn onClick={() => setShowNewDeck(false)}>Cancel</Btn>
              <Btn variant="accent" onClick={createDeck}>Create</Btn>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }} onClick={() => setShowImport(false)}>
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:24, maxWidth:600, width:"90%" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin:"0 0 8px", fontFamily:"'Cinzel', serif" }}>Import Decklist</h3>
            <p style={{ fontSize:13, color:T.textMuted, marginBottom:12 }}>One card per line: "4 Lightning Bolt" or "4x Lightning Bolt"</p>
            <textarea style={{ ...inputStyle, minHeight:200, resize:"vertical", fontFamily:"monospace", fontSize:13 }} placeholder={"4 Lightning Bolt\n4 Counterspell\n1 Sol Ring"} value={impText} onChange={e => setImpText(e.target.value)} />
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:12 }}>
              <Btn onClick={() => setShowImport(false)}>Cancel</Btn>
              <Btn variant="accent" onClick={importDeck} disabled={impLoading}>{impLoading ? "Importing..." : "Import"}</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
