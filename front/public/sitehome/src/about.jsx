// About — editorial split with big stat and animated feature list

function About({ config }) {
  const features = [
    { title: "Consulta pública", body: "Qualquer cidadão pesquisa placas e visualiza o veículo." },
    { title: "Fiscalização ativa", body: "Denúncias geram protocolos auditáveis com resposta em 24h." },
    { title: "Cadastro digital", body: "Motoristas e veículos regularizados em fluxo 100% online." },
    { title: "API aberta", body: "Integrações REST para municípios e operadores logísticos." },
  ];

  return (
    <section id="sobre" className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
      <div
        className="orb w-[400px] h-[400px] top-[10%] right-[-100px]"
        style={{ background: "radial-gradient(circle, rgba(124,92,255,0.2) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left column — editorial */}
          <div className="lg:col-span-5">
            <Reveal>
              <SectionEyebrow>
                <span>01 · Quem somos</span>
              </SectionEyebrow>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-balance">
                Transporte que <br />
                <span className="font-serif italic font-normal grad-text-2">respira</span>{" "}
                transparência.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-6 text-[var(--text-dim)] text-lg leading-relaxed text-pretty">
                {config.about_text}
              </p>
            </Reveal>
            <Reveal delay={3}>
              <div className="mt-8 flex items-center gap-6">
                <div>
                  <div className="font-bold text-4xl grad-text">
                    <AnimatedCounter end={4.9} duration={1500} format={false} />
                    <span className="text-white">/5</span>
                  </div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">
                    Satisfação do usuário
                  </div>
                </div>
                <div className="w-px h-14 bg-white/10" />
                <div>
                  <div className="font-bold text-4xl text-white">
                    <AnimatedCounter end={142} duration={1500} />
                    <span className="grad-text-2">+</span>
                  </div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--text-muted)] mt-1">
                    Municípios atendidos
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right column — feature grid */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={Math.min(i + 1, 5)}>
                  <div className="group relative p-6 rounded-2xl bg-white/[0.02] border border-white/10 card-elev h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/0 border border-white/10 flex items-center justify-center text-[var(--primary-2)]">
                        <IconCheck size={18} />
                      </div>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-sm text-[var(--text-dim)] leading-relaxed">{f.body}</p>
                    <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconArrowUpRight size={14} className="text-[var(--primary-2)]" />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { About });
