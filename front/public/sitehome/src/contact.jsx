// Contact section — big contact card with details and "CTA" gradient tile

function Contact({ config }) {
  const items = [
    { label: "Telefone", value: config.phone, icon: "IconPhone", href: `tel:${config.phone.replace(/\D/g, "")}` },
    { label: "E-mail", value: config.email, icon: "IconMail", href: `mailto:${config.email}` },
    { label: "WhatsApp", value: "+55 " + config.phone.replace(/[^\d]/g, "").replace(/^55/, ""), icon: "IconMessageCircle", href: `https://wa.me/${config.whatsapp}` },
    { label: "Endereço", value: config.address, icon: "IconMap" },
  ];

  return (
    <section id="contato" className="relative py-28 md:py-36 overflow-hidden">
      <div
        className="orb w-[500px] h-[500px] bottom-[-200px] left-[-150px]"
        style={{ background: "radial-gradient(circle, rgba(124,92,255,0.2) 0%, transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* CTA card */}
          <div className="lg:col-span-5">
            <Reveal>
              <div className="relative h-full rounded-3xl overflow-hidden p-10 border border-white/10 bg-gradient-to-br from-[#7c5cff] via-[#b06cff] to-[#22d3ee]">
                <div className="absolute inset-0 grid-bg-dense opacity-20" aria-hidden="true" />
                <div className="relative h-full flex flex-col">
                  <SectionEyebrow>
                    <span className="text-white/90">06 · Contato</span>
                  </SectionEyebrow>
                  <h2 className="mt-5 text-4xl md:text-5xl font-bold tracking-tight leading-[1.05] text-white text-balance">
                    Vamos conversar sobre sua{" "}
                    <span className="font-serif italic font-normal">frota</span>.
                  </h2>
                  <p className="mt-5 text-white/80 text-lg leading-relaxed max-w-md text-pretty">
                    Integrações, parcerias institucionais ou suporte — nossa equipe responde em até 1 dia útil.
                  </p>
                  <div className="mt-auto pt-10 flex items-center gap-3">
                    <a
                      href={`https://wa.me/${config.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#07070d] text-white text-sm font-semibold hover:bg-black transition-colors"
                    >
                      <IconMessageCircle size={16} />
                      WhatsApp direto
                    </a>
                    <a
                      href={`mailto:${config.email}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/20 backdrop-blur text-white text-sm font-semibold hover:bg-white/30 transition-colors border border-white/20"
                    >
                      <IconMail size={16} />
                      E-mail
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Contact details */}
          <div className="lg:col-span-7">
            <div className="grid sm:grid-cols-2 gap-4 h-full">
              {items.map((item, i) => {
                const Icon = window[item.icon];
                const Comp = item.href ? "a" : "div";
                return (
                  <Reveal key={item.label} delay={Math.min(i + 1, 4)}>
                    <Comp
                      href={item.href}
                      target={item.href && item.href.startsWith("http") ? "_blank" : undefined}
                      rel={item.href && item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="group relative block p-7 rounded-3xl bg-white/[0.02] border border-white/10 card-elev h-full shine-hover"
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#7c5cff]/20 to-[#22d3ee]/10 border border-white/10 flex items-center justify-center text-[var(--primary-2)]">
                          {Icon && <Icon size={18} />}
                        </div>
                        {item.href && (
                          <IconArrowUpRight size={16} className="text-[var(--text-muted)] group-hover:text-white transition-colors" />
                        )}
                      </div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)] mb-1.5">
                        {item.label}
                      </div>
                      <div className="text-white text-lg font-medium leading-snug">
                        {item.value}
                      </div>
                    </Comp>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Contact });
