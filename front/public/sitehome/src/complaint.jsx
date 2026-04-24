// Denúncias section — hero CTA card with features

function Complaint({ onOpenModal }) {
  const features = [
    { title: "Anônimo por padrão", body: "Identificação 100% opcional.", icon: "IconEye" },
    { title: "Com protocolo", body: "Acompanhe em tempo real.", icon: "IconHash" },
    { title: "Até 5 fotos", body: "Evidências anexadas com segurança.", icon: "IconCamera" },
    { title: "Resposta em 24h", body: "Equipe dedicada analisa cada caso.", icon: "IconClock" },
  ];

  return (
    <section id="denuncias" className="relative py-28 md:py-36 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,122,89,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
        <Reveal>
          <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,89,0.08),rgba(124,92,255,0.06)_50%,rgba(7,7,13,1))]">
            <div className="absolute inset-0 grid-bg-dense opacity-20" aria-hidden="true" />
            <div
              className="orb w-[500px] h-[500px] top-[-150px] right-[-150px]"
              style={{ background: "radial-gradient(circle, rgba(255,122,89,0.3) 0%, transparent 70%)" }}
              aria-hidden="true"
            />

            <div className="relative grid lg:grid-cols-12 gap-10 p-8 md:p-14">
              <div className="lg:col-span-7">
                <SectionEyebrow>
                  <span>03 · Fiscalização cidadã</span>
                </SectionEyebrow>
                <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-balance">
                  Viu algo errado?{" "}
                  <span className="font-serif italic font-normal text-[#ff9f43]">Denuncie</span>{" "}
                  em menos de 2 minutos.
                </h2>
                <p className="mt-6 text-[var(--text-dim)] text-lg leading-relaxed max-w-xl text-pretty">
                  Conduta imprudente, veículo clandestino, irregularidade na cobrança — sua denúncia aciona a fiscalização com protocolo digital rastreável.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onOpenModal("denuncia")}
                    className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
                  >
                    <IconFlag size={16} />
                    Registrar denúncia
                    <IconArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => onOpenModal("consulta")}
                    className="btn-ghost inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium"
                  >
                    <IconSearch size={14} />
                    Consultar protocolo
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                  <IconLock size={12} />
                  <span>Criptografia ponta-a-ponta · LGPD · dados protegidos</span>
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-3 self-center">
                {features.map((f, i) => {
                  const Icon = window[f.icon];
                  return (
                    <Reveal key={f.title} delay={Math.min(i + 1, 4)}>
                      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 card-elev h-full">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ff9f43]/20 to-[#7c5cff]/10 border border-white/10 flex items-center justify-center mb-3">
                          {Icon && <Icon size={16} className="text-[#ff9f43]" />}
                        </div>
                        <div className="font-semibold text-sm text-white mb-1">{f.title}</div>
                        <div className="text-xs text-[var(--text-dim)] leading-snug">{f.body}</div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

Object.assign(window, { Complaint });
