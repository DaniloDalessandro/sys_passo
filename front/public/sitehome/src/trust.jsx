// Trust marquee — partner logos on a ticker

function Trust() {
  const items = [...PARTNERS, ...PARTNERS];
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.01] overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)]">
            Conectado a · parceiros institucionais
          </span>
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--text-muted)] hidden sm:block">
            {PARTNERS.length}+ integrações
          </span>
        </div>
      </div>
      <div className="mask-fade-x">
        <div className="ticker-track">
          {items.map((p, i) => (
            <div key={i} className="flex items-center gap-3 px-8 text-[var(--text-dim)] hover:text-white transition-colors">
              <IconSparkle size={12} className="text-[var(--primary)]" />
              <span className="font-mono text-sm tracking-[0.2em] uppercase whitespace-nowrap">
                {p}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Trust });
