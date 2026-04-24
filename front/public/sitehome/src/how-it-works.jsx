// How it works — 3 numbered steps with connecting line

function HowItWorks() {
  return (
    <section className="relative py-28 md:py-36">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="max-w-2xl mb-14">
          <Reveal>
            <SectionEyebrow>
              <span>04 · Como funciona</span>
            </SectionEyebrow>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-balance">
              Três passos.{" "}
              <span className="font-serif italic font-normal grad-text-2">Zero burocracia.</span>
            </h2>
          </Reveal>
        </div>

        <div className="relative grid md:grid-cols-3 gap-5">
          {/* Connecting line */}
          <div
            className="hidden md:block absolute top-[84px] left-[10%] right-[10%] h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(124,92,255,0.5), rgba(34,211,238,0.5), transparent)",
            }}
            aria-hidden="true"
          />

          {HOW_STEPS.map((step, i) => (
            <Reveal key={step.n} delay={Math.min(i + 1, 3)}>
              <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 card-elev h-full">
                <div className="relative mb-6 flex items-center justify-between">
                  <div className="relative w-16 h-16 rounded-2xl bg-[#0e0f1d] border border-white/10 flex items-center justify-center">
                    <span className="font-serif italic text-[34px] font-normal grad-text">{step.n}</span>
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#7c5cff]/30 to-[#22d3ee]/20 blur-xl -z-10" />
                  </div>
                  <div className="text-[var(--text-muted)]">
                    <IconArrowRight size={18} />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-3 tracking-tight">{step.title}</h3>
                <p className="text-[var(--text-dim)] leading-relaxed">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { HowItWorks });
