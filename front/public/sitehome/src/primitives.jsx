// Reusable primitives: AnimatedCounter, Reveal, SectionEyebrow, Tilt card, etc.

const { useEffect, useRef, useState, useCallback } = React;

// Count-up with IntersectionObserver
function AnimatedCounter({ end, duration = 1800, suffix = "", start = 0, format = true }) {
  const [value, setValue] = useState(start);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !visible) setVisible(true);
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    let raf;
    let t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, end, duration, start]);

  const display = format ? Math.floor(value).toLocaleString("pt-BR") : Math.floor(value);

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

// Wraps children with scroll-reveal class
function Reveal({ children, delay = 0, as: Tag = "div", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("visible");
          io.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const delayClass = delay ? `reveal-delay-${delay}` : "";
  return (
    <Tag ref={ref} className={`reveal ${delayClass} ${className}`}>
      {children}
    </Tag>
  );
}

// Section eyebrow
function SectionEyebrow({ children }) {
  return <div className="section-eyebrow">{children}</div>;
}

// Tilt card on hover (subtle)
function Tilt({ children, className = "", intensity = 8, style = {} }) {
  const ref = useRef(null);
  const onMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * intensity).toFixed(2)}deg) rotateY(${(x * intensity).toFixed(2)}deg) translateY(-2px)`;
    },
    [intensity]
  );
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: "preserve-3d", ...style }}
    >
      {children}
    </div>
  );
}

// Copy button
function CopyInline({ text, children }) {
  const [copied, setCopied] = useState(false);
  const copy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-[var(--text-dim)] hover:text-white transition-colors focus-ring rounded"
    >
      {children}
      <span className="text-[10px] font-mono text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? "COPIADO" : "COPIAR"}
      </span>
    </button>
  );
}

// Magnet button — slight pull toward cursor
function MagnetButton({ children, className = "", onClick, as: Tag = "button", href, ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.24}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  const props = { ref, onMouseMove: onMove, onMouseLeave: onLeave, className: `inline-block transition-transform duration-200 ${className}`, onClick, ...rest };
  if (Tag === "a") props.href = href;
  return <Tag {...props}>{children}</Tag>;
}

// Plate display (realistic Mercosul-ish)
function Plate({ value, small = false }) {
  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-bold tracking-[0.2em] text-[#0a1020] bg-white rounded-md border-2 border-[#0a1020] ${
        small ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
    >
      {value}
    </span>
  );
}

// Dot indicator
function LiveDot({ color = "#c5ff4a", label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex w-2 h-2">
        <span
          className="absolute inset-0 rounded-full pulse-dot"
          style={{ background: color }}
        />
        <span
          className="relative inline-block w-2 h-2 rounded-full"
          style={{ background: color }}
        />
      </span>
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-dim)]">
        {label}
      </span>
    </span>
  );
}

Object.assign(window, {
  AnimatedCounter, Reveal, SectionEyebrow, Tilt, CopyInline, MagnetButton, Plate, LiveDot,
});
