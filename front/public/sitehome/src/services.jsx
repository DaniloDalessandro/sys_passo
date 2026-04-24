// Services section — 4 feature cards with animated icons and CTA to modals

function Services({ onOpenModal }) {
  return (
    <section id="servicos" className="relative py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="max-w-2xl mb-14">
          <Reveal>
            <SectionEyebrow>
              <span>02 · Serviços</span>
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-balance">
              Tudo que você precisa,{" "}
              <span className="font-serif italic font-normal grad-text">sem sair da página</span>.
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="mt-5 text-[var(--text-dim)] text-lg leading-relaxed text-pretty">
              Quatro fluxos essenciais — cadastre, denuncie, consulte e acompanhe. Cada um com protocolo digital e trilha auditável.
            </p>
          </Reveal>
        </div>

        <div id="cadastro" className="grid md:grid-cols-2 gap-5">
          {SERVICES.map((svc, i) => {
            const Icon = window[svc.icon];
            const accentMap = {
              violet: "from-[#7c5cff] to-[#b06cff]",
              cyan: "from-[#22d3ee] to-[#7c5cff]",
              amber: "from-[#ff9f43] to-[#ff7a59]",
              lime: "from-[#c5ff4a] to-[#22d3ee]",
            };
            const accent = accentMap[svc.accent];
            return (
              <Reveal key={svc.id} delay={Math.min(i + 1, 4)}>
                <Tilt intensity={5} className="h-full">
                  <button
                    onClick={() => onOpenModal(svc.id)}
                    className="relative w-full text-left h-full p-7 rounded-3xl bg-white/[0.02] border border-white/10 card-elev overflow-hidden group shine-hover"
                  >
                    {/* Glow ring on hover */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`}
                      aria-hidden="true"
                    />
                    <div className="relative flex items-start justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${accent} mb-5 shadow-lg shadow-black/40`}>
                          {Icon && <Icon size={26} className="text-[#07070d]" stroke={2.2} />}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)]">
                            0{i + 1} · {svc.accent.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2.5 tracking-tight">
                          {svc.title}
                        </h3>
                        <p className="text-[var(--text-dim)] text-[15px] leading-relaxed mb-6">
                          {svc.description}
                        </p>
                        <ol className="space-y-2 mb-6">
                          {svc.steps.map((step, j) => (
                            <li key={j} className="flex items-center gap-3 text-sm text-[var(--text-dim)]">
                              <span className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-mono text-[10px] text-white">
                                {j + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-white group-hover:text-[var(--primary-2)] transition-colors">
                          Iniciar agora
                          <IconArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </button>
                </Tilt>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Services });
