// Modal shell + forms for cadastro de motorista, veículo, denúncia e consulta de protocolo

const { useState: useStateMod, useEffect: useEffectMod, useRef: useRefMod } = React;

function ModalShell({ open, onClose, title, subtitle, children, size = "md" }) {
  useEffectMod(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" }[size];

  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="modal-backdrop absolute inset-0 animate-[fade-in_200ms]" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} my-8 rounded-3xl border border-white/10 bg-[#0b0c18] shadow-2xl shadow-black/70 overflow-hidden animate-[fade-in_300ms]`}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent" />
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-white/5">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--primary-2)] mb-2">
              ViaLumiar · formulário
            </div>
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{title}</h3>
            {subtitle && <p className="mt-2 text-[var(--text-dim)] text-sm">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors shrink-0"
          >
            <IconClose size={16} />
          </button>
        </div>
        <div className="p-6 md:p-8 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-2">
        {label} {required && <span className="text-[#ff9f43]">*</span>}
      </label>
      {children}
      {hint && <div className="mt-1.5 text-[11px] text-[var(--text-muted)]">{hint}</div>}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:bg-white/[0.05] focus:outline-none transition-colors";

function SuccessPanel({ protocol, onClose, kind }) {
  const labels = {
    motorista: "Cadastro de motorista recebido!",
    veiculo: "Cadastro de veículo recebido!",
    denuncia: "Denúncia registrada com sucesso!",
  };
  return (
    <div className="text-center py-6">
      <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[#c5ff4a] to-[#22d3ee] flex items-center justify-center mb-6">
        <IconCheck size={36} className="text-[#07070d]" stroke={3} />
        <div className="absolute inset-0 rounded-full bg-[#c5ff4a] blur-2xl opacity-40 -z-10" />
      </div>
      <h4 className="text-2xl font-bold text-white mb-2">{labels[kind]}</h4>
      <p className="text-[var(--text-dim)] mb-6">Guarde este protocolo para acompanhar o andamento:</p>
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-lg text-white">
        <IconHash size={16} className="text-[var(--primary-2)]" />
        {protocol}
      </div>
      <div className="mt-8">
        <button onClick={onClose} className="btn-primary px-6 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2">
          Fechar <IconArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// --- Motorista ---
function DriverForm({ onDone }) {
  const [loading, setLoading] = useStateMod(false);
  const [done, setDone] = useStateMod(null);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const protocol = await simulateApi(() => "MOT-" + Math.floor(100000 + Math.random() * 900000), 900);
    setDone(protocol);
    setLoading(false);
  };
  if (done) return <SuccessPanel protocol={done} onClose={onDone} kind="motorista" />;
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Nome completo" required><input className={inputCls} placeholder="Ana Silva" required /></Field>
      <Field label="CPF" required><input className={inputCls} placeholder="000.000.000-00" required /></Field>
      <Field label="Data de nascimento" required><input type="date" className={inputCls} required /></Field>
      <Field label="Telefone" required><input className={inputCls} placeholder="(11) 99999-9999" required /></Field>
      <Field label="E-mail" required full><input type="email" className={inputCls} placeholder="ana@email.com" required /></Field>
      <Field label="Nº da CNH" required><input className={inputCls} placeholder="01234567890" required /></Field>
      <Field label="Categoria" required>
        <select className={inputCls} required>
          <option value="">Selecione</option>
          {["A","B","AB","C","D","E"].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Validade da CNH" required full><input type="date" className={inputCls} required /></Field>
      <Field label="Endereço completo" required full hint="Rua, número, bairro, cidade"><textarea rows="2" className={inputCls} placeholder="Av. Paulista, 1578 · Bela Vista · São Paulo" required /></Field>
      <Field label="Foto do motorista" full hint="JPG ou PNG · até 5MB">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-dashed border-white/10 hover:border-white/20 transition-colors cursor-pointer">
          <IconUpload size={18} className="text-[var(--primary-2)]" />
          <span className="text-sm text-[var(--text-dim)]">Clique para enviar ou arraste aqui</span>
        </div>
      </Field>
      <div className="col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
        <button type="button" onClick={onDone} className="btn-ghost px-5 py-2.5 rounded-full text-sm font-medium">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
          {loading ? <><IconLoader size={14} /> Enviando...</> : <>Enviar solicitação <IconArrowRight size={14} /></>}
        </button>
      </div>
    </form>
  );
}

// --- Veículo ---
function VehicleForm({ onDone }) {
  const [loading, setLoading] = useStateMod(false);
  const [done, setDone] = useStateMod(null);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const protocol = await simulateApi(() => "VEI-" + Math.floor(100000 + Math.random() * 900000), 900);
    setDone(protocol);
    setLoading(false);
  };
  if (done) return <SuccessPanel protocol={done} onClose={onDone} kind="veiculo" />;
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Placa" required><input className={`${inputCls} font-mono tracking-[0.2em] uppercase`} placeholder="ABC1D23" required maxLength={8} /></Field>
      <Field label="Marca" required><input className={inputCls} placeholder="Volkswagen" required /></Field>
      <Field label="Modelo" required><input className={inputCls} placeholder="Gol 1.6 MSI" required /></Field>
      <Field label="Ano" required><input type="number" className={inputCls} placeholder="2024" required /></Field>
      <Field label="Cor" required><input className={inputCls} placeholder="Prata" required /></Field>
      <Field label="Combustível" required>
        <select className={inputCls} required>
          <option value="">Selecione</option>
          {["Flex","Gasolina","Etanol","Diesel","Elétrico","Híbrido"].map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Chassi" required><input className={inputCls} placeholder="9BW..." required /></Field>
      <Field label="RENAVAM" required><input className={inputCls} placeholder="00000000000" required /></Field>
      <Field label="Categoria" required>
        <select className={inputCls} required>
          <option value="">Selecione</option>
          {["Passeio","Utilitário","Van Escolar","Carga","Táxi","Aplicativo"].map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Capacidade (passageiros)" required><input type="number" className={inputCls} placeholder="5" required /></Field>
      <Field label="Fotos do veículo" full hint="Até 5 imagens · frente, traseira, laterais, interior">
        <div className="grid grid-cols-5 gap-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="aspect-square rounded-lg border border-dashed border-white/10 bg-white/[0.02] flex items-center justify-center text-[var(--text-muted)] hover:border-white/20 transition-colors cursor-pointer">
              <IconCamera size={16} />
            </div>
          ))}
        </div>
      </Field>
      <div className="col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
        <button type="button" onClick={onDone} className="btn-ghost px-5 py-2.5 rounded-full text-sm font-medium">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
          {loading ? <><IconLoader size={14} /> Enviando...</> : <>Enviar solicitação <IconArrowRight size={14} /></>}
        </button>
      </div>
    </form>
  );
}

// --- Denúncia ---
function ComplaintForm({ onDone }) {
  const [loading, setLoading] = useStateMod(false);
  const [done, setDone] = useStateMod(null);
  const [photos, setPhotos] = useStateMod([]);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const protocol = await simulateApi(() => "DEN-" + Math.floor(100000 + Math.random() * 900000), 900);
    setDone(protocol);
    setLoading(false);
  };
  if (done) return <SuccessPanel protocol={done} onClose={onDone} kind="denuncia" />;
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Placa do veículo" required><input className={`${inputCls} font-mono tracking-[0.2em] uppercase`} placeholder="ABC1D23" required /></Field>
      <Field label="Tipo de denúncia" required>
        <select className={inputCls} required>
          <option value="">Selecione</option>
          {["Conduta imprudente","Veículo clandestino","Cobrança irregular","Condição precária","Outro"].map(c => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Data da ocorrência" full><input type="datetime-local" className={inputCls} /></Field>
      <Field label="Descrição" required full hint="Mínimo 20 caracteres">
        <textarea rows="4" className={inputCls} placeholder="Descreva o ocorrido com o máximo de detalhes..." required minLength={20} />
      </Field>
      <Field label="Fotos (opcional)" full hint="Até 5 fotos · JPG ou PNG">
        <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl bg-white/[0.02] border border-dashed border-white/10 hover:border-[var(--primary)] transition-colors cursor-pointer">
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => setPhotos(Array.from(e.target.files).slice(0,5))} />
          <IconUpload size={22} className="text-[var(--primary-2)]" />
          <span className="text-sm text-[var(--text-dim)]">Clique ou arraste imagens aqui</span>
          {photos.length > 0 && (
            <span className="font-mono text-[11px] text-[var(--primary-2)]">{photos.length} imagem{photos.length > 1 ? "ns" : ""} selecionada{photos.length > 1 ? "s" : ""}</span>
          )}
        </label>
      </Field>
      <div className="col-span-2 p-4 rounded-xl bg-[#c5ff4a]/5 border border-[#c5ff4a]/20 flex items-start gap-3">
        <IconEye size={16} className="text-[#c5ff4a] mt-0.5" />
        <div className="text-xs text-[var(--text-dim)] leading-relaxed">
          <strong className="text-white">Identificação opcional.</strong> Se quiser ser notificado do andamento, preencha os campos abaixo. Seus dados não são compartilhados com o denunciado.
        </div>
      </div>
      <Field label="Seu nome (opcional)" full><input className={inputCls} placeholder="Anônimo" /></Field>
      <Field label="E-mail (opcional)"><input type="email" className={inputCls} placeholder="seu@email.com" /></Field>
      <Field label="Telefone (opcional)"><input className={inputCls} placeholder="(11) 99999-9999" /></Field>
      <div className="col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
        <button type="button" onClick={onDone} className="btn-ghost px-5 py-2.5 rounded-full text-sm font-medium">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-60">
          {loading ? <><IconLoader size={14} /> Enviando...</> : <><IconFlag size={14} /> Registrar denúncia</>}
        </button>
      </div>
    </form>
  );
}

// --- Consulta de protocolo ---
function ConsultForm({ onDone }) {
  const [protocol, setProtocol] = useStateMod("");
  const [loading, setLoading] = useStateMod(false);
  const [result, setResult] = useStateMod(null);
  const [error, setError] = useStateMod("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!protocol.trim()) { setError("Informe o número do protocolo."); return; }
    setLoading(true);
    const res = await simulateApi(() => {
      if (/^(MOT|VEI|DEN)-\d{6}$/.test(protocol.trim().toUpperCase())) {
        const kind = protocol.slice(0,3).toUpperCase();
        const statuses = ["Em análise", "Aguardando documentos", "Aprovado", "Encaminhado à fiscalização"];
        return {
          protocol: protocol.trim().toUpperCase(),
          kind,
          status: statuses[Math.floor(Math.random()*statuses.length)],
          progress: Math.floor(Math.random()*80) + 20,
          createdAt: "14/04/2026 · 09:42",
          lastUpdate: "Hoje · 11:18",
        };
      }
      return null;
    }, 700);
    setLoading(false);
    if (!res) setError("Protocolo não encontrado. Verifique o número e tente novamente.");
    else setResult(res);
  };

  if (result) {
    const kindLabel = { MOT: "Cadastro de Motorista", VEI: "Cadastro de Veículo", DEN: "Denúncia" }[result.kind];
    return (
      <div>
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#7c5cff]/10 to-[#22d3ee]/5 border border-white/10 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">Protocolo</div>
              <div className="font-mono text-lg text-white mt-1">{result.protocol}</div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-[#c5ff4a]/10 border border-[#c5ff4a]/30 text-[#c5ff4a] font-mono text-[11px] uppercase tracking-wider">
              {result.status}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Tipo</div>
              <div className="text-sm text-white mt-1">{kindLabel}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">Criado em</div>
              <div className="text-sm text-white mt-1">{result.createdAt}</div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">
              <span>Progresso</span>
              <span>{result.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7c5cff] to-[#22d3ee] transition-all duration-1000"
                style={{ width: `${result.progress}%` }}
              />
            </div>
          </div>
        </div>
        <button onClick={onDone} className="btn-primary w-full py-3 rounded-full text-sm font-semibold">Fechar</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Número do protocolo" required hint="Formato: MOT-000000, VEI-000000 ou DEN-000000">
        <input
          className={`${inputCls} font-mono tracking-wider uppercase`}
          placeholder="DEN-123456"
          value={protocol}
          onChange={(e) => setProtocol(e.target.value.toUpperCase())}
          required
        />
      </Field>
      {error && (
        <div className="p-3 rounded-lg bg-[#ff7a59]/10 border border-[#ff7a59]/30 text-[#ff9f43] text-sm flex items-center gap-2">
          <IconAlert size={14} /> {error}
        </div>
      )}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
        <button type="button" onClick={onDone} className="btn-ghost px-5 py-2.5 rounded-full text-sm font-medium">Cancelar</button>
        <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold inline-flex items-center gap-2">
          {loading ? <><IconLoader size={14} /> Buscando...</> : <><IconSearch size={14} /> Consultar</>}
        </button>
      </div>
    </form>
  );
}

function Modals({ open, onClose }) {
  const titles = {
    motorista: { title: "Cadastro de Motorista", subtitle: "Regularize um condutor em 5 minutos. Aprovação em até 72h úteis." },
    veiculo:   { title: "Cadastro de Veículo",   subtitle: "Registre o veículo com documentação e fotos. Acompanhe via protocolo." },
    denuncia:  { title: "Registrar Denúncia",    subtitle: "Identificação opcional. Resposta em até 24h." },
    consulta:  { title: "Consultar Protocolo",   subtitle: "Acompanhe o andamento da sua solicitação." },
  };
  const cfg = titles[open] || {};
  return (
    <ModalShell open={!!open} onClose={onClose} title={cfg.title} subtitle={cfg.subtitle} size={open === "consulta" ? "sm" : "lg"}>
      {open === "motorista" && <DriverForm onDone={onClose} />}
      {open === "veiculo" && <VehicleForm onDone={onClose} />}
      {open === "denuncia" && <ComplaintForm onDone={onClose} />}
      {open === "consulta" && <ConsultForm onDone={onClose} />}
    </ModalShell>
  );
}

Object.assign(window, { Modals });
