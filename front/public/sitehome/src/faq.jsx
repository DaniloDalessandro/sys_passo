// FAQ — accordion with smooth expand

const { useState: useStateFaq } = React;

function FaqItem({ item, index, open, onToggle }) {
  return (
    <div className={`border-b border-white/10 transition-colors ${open ? "bg-white/[0.02]" : ""}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-6 py-6 text-left group"
      >
        <div className="flex items-start gap-4 min-w-0">
          <span className="font-mono text-xs text-[var(--text-muted)] mt-1 tracking-widest">
            0{index + 1}
          </span>
          <span className={`text-lg md:text-xl font-medium transition-colors ${open ? "text-white" : "text-[var(--text-dim)] group-hover:text-white"}`}>
            {item.q}
          </span>
        </div>
        <div className={`shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center transition-all ${open ? "bg-[var(--primary)] border-transparent rotate-180" : "bg-white/[0.02]"}`}>
          {open ? <IconMinus size={14} /> : <IconPlus size={14} />}
        </div>
      </button>
      <div
        className="grid transition-all duration-400 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-6 pl-10 pr-14 text-[var(--text-dim)] leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  const [openIdx, setOpenIdx] = useStateFaq(0);

  return (
    <section className="relative py-28 md:py-36">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <Reveal>
              <SectionEyebrow>
                <span>05 · Dúvidas</span>
              </SectionEyebrow>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-balance">
                Perguntas{" "}
                <span className="font-serif italic font-normal grad-text-2">frequentes</span>.
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-5 text-[var(--text-dim)] text-[15px] leading-relaxed">
                Não encontrou? Fale com a gente na seção de contato.
              </p>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <Reveal>
              <div className="border-t border-white/10">
                {FAQ.map((item, i) => (
                  <FaqItem
                    key={i}
                    item={item}
                    index={i}
                    open={openIdx === i}
                    onToggle={() => setOpenIdx(openIdx === i ? -1 : i)}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { FaqSection });
