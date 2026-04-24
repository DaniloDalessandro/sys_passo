// Vehicle result — shown after selecting a plate in hero. Appears as an overlay panel.

const { useEffect: useEffectVR } = React;

function VehicleResult({ data, onClose }) {
  useEffectVR(() => {
    if (!data) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [data]);

  if (!data) return null;

  const fuelLabel = {
    flex: "Flex", gasoline: "Gasolina", ethanol: "Etanol",
    diesel: "Diesel", electric: "Elétrico", hybrid: "Híbrido",
  }[data.fuel_type] || data.fuel_type;

  return (
    <div className="fixed inset-0 z-[90] flex items-start md:items-center justify-center p-4 overflow-y-auto">
      <div className="modal-backdrop absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl my-8 rounded-3xl border border-white/10 bg-[#0b0c18] shadow-2xl shadow-black/70 overflow-hidden animate-[fade-in_300ms]">
        {/* Top gradient bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7c5cff] via-[#22d3ee] to-[#c5ff4a]" />

        <div className="p-8 md:p-10 border-b border-white/5 flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Plate value={data.plate} />
              <div className="absolute -inset-2 bg-white/20 blur-xl -z-10" />
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--primary-2)] mb-1">
                Veículo · {data.status || "Ativo"}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {data.brand} <span className="text-[var(--text-dim)] font-normal">{data.model}</span>
              </h3>
              <div className="mt-1.5 flex items-center gap-2 text-sm text-[var(--text-dim)]">
                <LiveDot label="CONSULTA VÁLIDA" color="#c5ff4a" />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/[0.08] transition-colors shrink-0">
            <IconClose size={16} />
          </button>
        </div>

        <div className="p-6 md:p-10 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { l: "Marca", v: data.brand },
              { l: "Modelo", v: data.model },
              { l: "Ano", v: data.year },
              { l: "Cor", v: data.color },
              { l: "Combustível", v: fuelLabel },
              { l: "Categoria", v: data.category },
              { l: "Capacidade", v: `${data.passenger_capacity} pax` },
              { l: "Status", v: data.status || "Ativo", good: true },
            ].map((f) => (
              <div key={f.l} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 card-elev">
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-1.5">{f.l}</div>
                <div className={`text-base font-semibold ${f.good ? "text-[#c5ff4a]" : "text-white"}`}>
                  {f.v}
                </div>
              </div>
            ))}
          </div>

          {/* Photos placeholder strip */}
          <div className="mb-6">
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-muted)] mb-3 flex items-center gap-2">
              <IconCamera size={12} /> Fotos do veículo
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[0,1,2,3,4].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex items-center justify-center text-[var(--text-muted)] relative overflow-hidden group">
                  <div className="absolute inset-0 grid-bg-dense opacity-20" />
                  <IconCar size={28} stroke={1.2} className="relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute bottom-2 left-2 font-mono text-[9px] tracking-widest text-[var(--text-muted)]">FOTO 0{i+1}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Current conductor */}
          {data.current_conductor ? (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7c5cff]/10 to-transparent border border-[#7c5cff]/20">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--primary-2)] mb-4 flex items-center gap-2">
                <IconUser size={12} /> Motorista vinculado
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { l: "Nome", v: data.current_conductor.full_name },
                  { l: "CPF", v: data.current_conductor.cpf },
                  { l: "CNH", v: data.current_conductor.cnh_number },
                  { l: "Categoria", v: data.current_conductor.cnh_category },
                ].map((f) => (
                  <div key={f.l}>
                    <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--text-muted)] mb-1">{f.l}</div>
                    <div className="text-sm text-white font-medium">{f.v}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 flex items-center gap-4">
              <IconAlert size={20} className="text-[#ff9f43]" />
              <div>
                <div className="text-sm font-medium text-white">Sem motorista vinculado</div>
                <div className="text-xs text-[var(--text-dim)]">Este veículo está cadastrado mas sem condutor associado no momento.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VehicleResult });
