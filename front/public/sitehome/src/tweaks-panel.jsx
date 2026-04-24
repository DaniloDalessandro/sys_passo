// Tweaks panel — expose palette accent, hero bg variant, grain, corner style

const { useEffect: useEffectTw, useState: useStateTw } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "violet",
  "grain": true,
  "heroBg": "orbs",
  "radius": "lg"
}/*EDITMODE-END*/;

function applyTweaks(t) {
  const root = document.documentElement;
  const accentMap = {
    violet: { p: "#7c5cff", p2: "#b06cff", a: "#22d3ee" },
    cyan:   { p: "#22d3ee", p2: "#7c5cff", a: "#c5ff4a" },
    lime:   { p: "#c5ff4a", p2: "#22d3ee", a: "#7c5cff" },
    warm:   { p: "#ff7a59", p2: "#ff9f43", a: "#7c5cff" },
  };
  const a = accentMap[t.accent] || accentMap.violet;
  root.style.setProperty("--primary", a.p);
  root.style.setProperty("--primary-2", a.p2);
  root.style.setProperty("--accent", a.a);

  document.body.classList.toggle("no-grain", !t.grain);
  document.body.dataset.heroBg = t.heroBg;
  document.body.dataset.radius = t.radius;
}

function TweaksPanel({ tweaks, setTweaks, visible, onClose }) {
  if (!visible) return null;
  const update = (k, v) => setTweaks((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="fixed bottom-5 right-5 z-[200] w-[320px] rounded-2xl border border-white/10 bg-[#0b0c18]/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div>
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--primary-2)]">Tweaks</div>
          <div className="text-sm font-semibold text-white">Design controls</div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors">
          <IconClose size={12} />
        </button>
      </div>
      <div className="p-4 space-y-5">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">Acento</div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: "violet", c: "linear-gradient(135deg,#7c5cff,#b06cff)" },
              { id: "cyan",   c: "linear-gradient(135deg,#22d3ee,#7c5cff)" },
              { id: "lime",   c: "linear-gradient(135deg,#c5ff4a,#22d3ee)" },
              { id: "warm",   c: "linear-gradient(135deg,#ff7a59,#ff9f43)" },
            ].map((c) => (
              <button
                key={c.id}
                onClick={() => update("accent", c.id)}
                className={`h-10 rounded-lg border transition-all ${tweaks.accent === c.id ? "border-white ring-2 ring-white/30 scale-95" : "border-white/10"}`}
                style={{ background: c.c }}
                aria-label={c.id}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">Hero</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "orbs", label: "Orbs + Grid" },
              { id: "dots", label: "Dots denso" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => update("heroBg", o.id)}
                className={`px-3 py-2 rounded-lg border text-[11px] font-medium transition-all ${tweaks.heroBg === o.id ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/10 text-[var(--text-dim)] hover:text-white"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">Raio dos cards</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "sm", label: "Nítido" },
              { id: "lg", label: "Suave" },
              { id: "xl", label: "Pílula" },
            ].map((o) => (
              <button
                key={o.id}
                onClick={() => update("radius", o.id)}
                className={`px-3 py-2 rounded-lg border text-[11px] font-medium transition-all ${tweaks.radius === o.id ? "bg-white/10 border-white/20 text-white" : "bg-white/[0.02] border-white/10 text-[var(--text-dim)]"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)]">Ruído</div>
          <button
            onClick={() => update("grain", !tweaks.grain)}
            className={`w-10 h-6 rounded-full relative transition-colors ${tweaks.grain ? "bg-[var(--primary)]" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${tweaks.grain ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function useTweaks() {
  const [tweaks, setTweaks] = useStateTw(TWEAK_DEFAULTS);
  const [visible, setVisible] = useStateTw(false);

  useEffectTw(() => { applyTweaks(tweaks); }, [tweaks]);

  useEffectTw(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setVisible(true);
      if (e.data.type === "__deactivate_edit_mode") setVisible(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffectTw(() => {
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: tweaks }, "*");
  }, [tweaks]);

  const close = () => {
    setVisible(false);
    window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
  };

  return { tweaks, setTweaks, visible, close };
}

Object.assign(window, { TweaksPanel, useTweaks });
