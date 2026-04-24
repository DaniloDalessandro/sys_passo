// Navbar — sticky, translucent, with scroll-based style and mobile menu.

const { useEffect: useEffectNav, useState: useStateNav } = React;

function Navbar({ config, onOpenModal }) {
  const [scrolled, setScrolled] = useStateNav(false);
  const [open, setOpen] = useStateNav(false);
  const [active, setActive] = useStateNav("inicio");

  useEffectNav(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const sections = ["inicio", "sobre", "servicos", "denuncias", "contato"];
      let current = "inicio";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
    setOpen(false);
  };

  const links = [
    { id: "inicio", label: "Início" },
    { id: "sobre", label: "Sobre" },
    { id: "servicos", label: "Serviços" },
    { id: "denuncias", label: "Denúncias" },
    { id: "contato", label: "Contato" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(7,7,13,0.78)] backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <a href="#inicio" onClick={(e) => { e.preventDefault(); go("inicio"); }} className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cff] via-[#b06cff] to-[#22d3ee] flex items-center justify-center shadow-lg shadow-[rgba(124,92,255,0.35)] group-hover:shadow-[rgba(124,92,255,0.55)] transition-shadow">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#07070d" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 13l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5" />
                  <path d="M3 13h18v4H3z" />
                  <circle cx="7.5" cy="15.5" r="1" fill="#07070d" />
                  <circle cx="16.5" cy="15.5" r="1" fill="#07070d" />
                </svg>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#7c5cff] to-[#22d3ee] blur-md opacity-40 -z-10 group-hover:opacity-70 transition-opacity" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-[17px] tracking-tight text-white">
                Via<span className="grad-text-2">Lumiar</span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.3em] text-[var(--text-muted)] mt-0.5">
                FLEET · OS
              </span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-full p-1">
            {links.map((l) => (
              <button
                key={l.id}
                onClick={() => go(l.id)}
                className={`nav-link px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active === l.id ? "text-white bg-white/5" : "text-[var(--text-dim)] hover:text-white"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => onOpenModal("consulta")}
              className="text-sm text-[var(--text-dim)] hover:text-white transition-colors font-medium"
            >
              Consultar protocolo
            </button>
            <a
              href="#login"
              onClick={(e) => e.preventDefault()}
              className="btn-primary inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full"
            >
              <IconLogin size={14} />
              Entrar
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Menu"
          >
            {open ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden pb-4 pt-2 border-t border-white/5 animate-[fade-in_200ms_ease]">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <button
                  key={l.id}
                  onClick={() => go(l.id)}
                  className="text-left px-3 py-3 rounded-lg text-[var(--text-dim)] hover:text-white hover:bg-white/5 text-sm font-medium"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex gap-2 mt-3 px-1">
                <button onClick={() => { onOpenModal("consulta"); setOpen(false); }} className="btn-ghost flex-1 text-sm font-medium py-2.5 rounded-full">
                  Consultar
                </button>
                <a href="#login" onClick={(e) => e.preventDefault()} className="btn-primary flex-1 text-center text-sm font-semibold py-2.5 rounded-full inline-flex items-center justify-center gap-2">
                  <IconLogin size={14} /> Entrar
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

Object.assign(window, { Navbar });
