// Hero — dark cinematic, orbs, grid, word-reveal title, plate search with autocomplete.

const { useState: useStateHero, useEffect: useEffectHero, useRef: useRefHero } = React;

function Hero({ config, onPlateSelect, onOpenModal }) {
  const [query, setQuery] = useStateHero("");
  const [sugs, setSugs] = useStateHero([]);
  const [openSug, setOpenSug] = useStateHero(false);
  const [loading, setLoading] = useStateHero(false);
  const [mouseXY, setMouseXY] = useStateHero({ x: 0.5, y: 0.5 });
  const wrapRef = useRefHero(null);

  useEffectHero(() => {
    if (query.length < 2) {
      setSugs([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await simulateApi(() => searchPlates(query), 280);
      setSugs(res);
      setLoading(false);
      setOpenSug(true);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  useEffectHero(() => {
    const onClick = (e) => {
      if (!e.target.closest(".plate-search-wrap")) setOpenSug(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSelect = (plate) => {
    setOpenSug(false);
    setQuery("");
    onPlateSelect(plate);
  };

  const onMouseMove = (e) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setMouseXY({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
    });
  };

  const words = config.hero_title.split(" ");

  return (
    <section
      id="inicio"
      ref={wrapRef}
      onMouseMove={onMouseMove}
      className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden noise"
    >
      {/* Decorative grid */}
      <div className="absolute inset-0 grid-bg opacity-80" aria-hidden="true" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(124,92,255,0.18) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Orbs with mouse parallax */}
      <div
        className="orb orb-1 w-[520px] h-[520px] top-[-120px] left-[-120px] -z-0"
        style={{
          background: "radial-gradient(circle, rgba(124,92,255,0.5) 0%, transparent 65%)",
          transform: `translate(${(mouseXY.x - 0.5) * -30}px, ${(mouseXY.y - 0.5) * -20}px)`,
        }}
        aria-hidden="true"
      />
      <div
        className="orb orb-2 w-[480px] h-[480px] bottom-[-120px] right-[-140px] -z-0"
        style={{
          background: "radial-gradient(circle, rgba(176,108,255,0.35) 0%, transparent 65%)",
          transform: `translate(${(mouseXY.x - 0.5) * 40}px, ${(mouseXY.y - 0.5) * 20}px)`,
        }}
        aria-hidden="true"
      />
      <div
        className="orb orb-3 w-[320px] h-[320px] top-[30%] right-[10%] -z-0"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      {/* Speed lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="speed-line" style={{ top: "22%", left: "0", width: "30%", animationDelay: "0.5s" }} />
        <div className="speed-line" style={{ top: "78%", left: "0", width: "40%", animationDelay: "2.2s" }} />
        <div className="speed-line" style={{ top: "55%", left: "0", width: "25%", animationDelay: "1.1s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-7 glow-border">
            <LiveDot label="SISTEMA ONLINE" />
            <span className="w-px h-3 bg-white/10" />
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-dim)]">
              v2.4 · LGPD compliant
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl lg:text-[96px] font-bold tracking-[-0.03em] leading-[0.95] text-balance">
            {words.map((w, i) => (
              <React.Fragment key={i}>
                <span className="inline-block overflow-hidden align-top">
                  <span
                    className="word inline-block"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    {i === 0 || i === words.length - 1 ? (
                      <span className="grad-text inline-block">{w}</span>
                    ) : (
                      <span className="text-white inline-block">{w}</span>
                    )}
                  </span>
                </span>
                {i < words.length - 1 ? " " : ""}
              </React.Fragment>
            ))}
          </h1>

          {/* Subtitle */}
          <p
            className="mt-8 text-lg md:text-xl text-[var(--text-dim)] max-w-2xl mx-auto leading-relaxed text-pretty word"
            style={{ animationDelay: "700ms" }}
          >
            {config.hero_subtitle}
          </p>

          {/* Plate search */}
          <div
            className="mt-12 plate-search-wrap relative max-w-2xl mx-auto word"
            style={{ animationDelay: "900ms" }}
          >
            <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-[#7c5cff] via-[#22d3ee] to-[#b06cff] opacity-30 blur-md" aria-hidden="true" />
            <div className="relative">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">
                <IconSearch size={18} />
              </div>
              <input
                type="text"
                value={query}
                placeholder="DIGITE A PLACA · ABC1D23"
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                onFocus={() => query.length >= 2 && sugs.length > 0 && setOpenSug(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && sugs.length > 0) onSelect(sugs[0].plate);
                  if (e.key === "Escape") setOpenSug(false);
                }}
                className="plate-input w-full pl-12 pr-32 py-5 text-base rounded-full font-mono"
                spellCheck={false}
                maxLength={8}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {loading && <IconLoader size={16} className="text-[var(--primary)] animate-spin" />}
                <button
                  onClick={() => sugs.length > 0 && onSelect(sugs[0].plate)}
                  className="btn-primary px-4 py-2.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  CONSULTAR
                  <IconArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Suggestion dropdown */}
            {openSug && query.length >= 2 && (
              <div className="absolute z-50 left-0 right-0 mt-3 bg-[#0b0c18] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden max-h-80 overflow-y-auto">
                {sugs.length === 0 && !loading ? (
                  <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">
                    Nenhuma placa encontrada para <span className="font-mono text-white">{query}</span>
                  </div>
                ) : (
                  <ul>
                    {sugs.map((s, i) => (
                      <li
                        key={s.plate}
                        onClick={() => onSelect(s.plate)}
                        className="px-5 py-3.5 cursor-pointer hover:bg-white/[0.04] border-b border-white/5 last:border-b-0 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <Plate value={s.plate} small />
                          <div className="text-left">
                            <div className="text-sm font-medium text-white">
                              {s.brand} <span className="text-[var(--text-dim)]">{s.model}</span>
                            </div>
                            <div className="text-[11px] font-mono uppercase tracking-wide text-[var(--text-muted)]">
                              {s.color} · {s.year} · {s.category}
                            </div>
                          </div>
                        </div>
                        <IconArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                      </li>
                    ))}
                  </ul>
                )}
                <div className="px-5 py-2 bg-white/[0.02] flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  <span>↵ consultar · esc fechar</span>
                  <span>{sugs.length} resultado{sugs.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-center gap-x-4 gap-y-2 flex-wrap text-xs text-[var(--text-muted)]">
              <span className="font-mono uppercase tracking-wider">Experimente:</span>
              {["ABC1D23", "BRA2E19", "VLM2024"].map((p) => (
                <button
                  key={p}
                  onClick={() => onSelect(p)}
                  className="font-mono text-[11px] px-2 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[var(--text-dim)] hover:text-white hover:border-white/15 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 word"
            style={{ animationDelay: "1100ms" }}
          >
            {STATS.map((s, i) => {
              const Icon = window[s.icon];
              return (
                <Tilt key={s.label} intensity={4} className="rounded-2xl">
                  <div className="relative bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-left backdrop-blur-sm card-elev shine-hover">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7c5cff]/20 to-[#22d3ee]/10 border border-white/10 flex items-center justify-center">
                        {Icon && <Icon size={16} className="text-[#b06cff]" />}
                      </div>
                      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[var(--text-muted)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="text-[26px] md:text-[32px] font-bold tracking-tight text-white leading-none">
                      <AnimatedCounter end={s.value} suffix={s.suffix} duration={1800 + i * 150} />
                    </div>
                    <div className="mt-1.5 text-[12px] md:text-[13px] text-[var(--text-dim)] leading-snug">
                      {s.label}
                    </div>
                  </div>
                </Tilt>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Hero });
