// Footer — big wordmark, columns, socials

function Footer({ config, onOpenModal }) {
  const go = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 72, behavior: "smooth" });
  };

  const cols = [
    {
      title: "Plataforma",
      items: [
        { label: "Consulta pública",        action: () => onOpenModal("consulta") },
        { label: "Cadastro de motorista",   action: () => onOpenModal("motorista") },
        { label: "Cadastro de veículo",     action: () => onOpenModal("veiculo") },
        { label: "Denúncias",               action: () => onOpenModal("denuncia") },
      ],
    },
    {
      title: "Institucional",
      items: [
        { label: "Sobre a ViaLumiar",  action: () => go("sobre") },
        { label: "Transparência",      href: "#" },
        { label: "LGPD",               href: "#" },
        { label: "Parceiros",          href: "#" },
      ],
    },
    {
      title: "Suporte",
      items: [
        { label: "Central de ajuda",       href: "/ajuda" },
        { label: "Status do sistema",      href: "#" },
        { label: "Documentação da API",    href: "#" },
        { label: "Contato",                action: () => go("contato") },
      ],
    },
  ];

  return (
    <footer className="relative pt-24 pb-10 border-t border-white/5 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,92,255,0.15) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] via-[#b06cff] to-[#22d3ee] flex items-center justify-center">
                <IconCar size={18} className="text-[#07070d]" stroke={2.3} />
              </div>
              <span className="font-bold text-[19px] tracking-tight text-white">
                Via<span className="grad-text-2">Lumiar</span>
              </span>
            </div>
            <p className="text-[var(--text-dim)] text-[15px] leading-relaxed max-w-md">
              Gestão inteligente de frotas com fiscalização cidadã. Iluminando cada quilômetro do transporte brasileiro.
            </p>
            <div className="mt-8 flex items-center gap-3">
              {[
                { icon: "IconFacebook", href: config.facebook_url },
                { icon: "IconInstagram", href: config.instagram_url },
                { icon: "IconLinkedin", href: config.linkedin_url },
              ].map((s, i) => {
                const Icon = window[s.icon];
                return (
                  <a
                    key={i}
                    href={s.href || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-[var(--text-dim)] hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {cols.map((c) => (
              <div key={c.title}>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] mb-4">
                  {c.title}
                </div>
                <ul className="space-y-2.5">
                  {c.items.map((it) => (
                    <li key={it.label}>
                      {it.action ? (
                        <button
                          onClick={it.action}
                          className="text-[var(--text-dim)] hover:text-white transition-colors text-sm text-left"
                        >
                          {it.label}
                        </button>
                      ) : (
                        <a
                          href={it.href}
                          className="text-[var(--text-dim)] hover:text-white transition-colors text-sm"
                        >
                          {it.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Big wordmark */}
        <div className="py-14 overflow-hidden">
          <div
            className="font-bold leading-[0.8] tracking-[-0.04em] whitespace-nowrap text-center select-none"
            style={{
              fontSize: "clamp(60px, 18vw, 260px)",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            VIALUMIAR
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-[var(--text-muted)] font-mono">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} VIALUMIAR · CNPJ 00.000.000/0001-00</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Termos</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white transition-colors">Cookies</a>
            <LiveDot label="ALL SYSTEMS OPERATIONAL" color="#c5ff4a" />
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Footer });
