// Mock data + simulated API. In a real app these come from Django.

const MOCK_CONFIG = {
  company_name: "ViaLumiar",
  hero_title: "Gestão Inteligente de Frotas",
  hero_subtitle:
    "Transparência, segurança e controle em tempo real. Consulte, cadastre e fiscalize — tudo em um só lugar.",
  about_text:
    "A ViaLumiar conecta operadores, motoristas e cidadãos em uma plataforma única de fiscalização e gestão de transporte. Tecnologia que ilumina cada quilômetro da sua frota.",
  phone: "(11) 4002-8922",
  email: "contato@vialumiar.com.br",
  address: "Av. Paulista, 1578 · 12º andar · Bela Vista, São Paulo · SP",
  whatsapp: "5511940028922",
  facebook_url: "https://facebook.com/vialumiar",
  instagram_url: "https://instagram.com/vialumiar",
  linkedin_url: "https://linkedin.com/company/vialumiar",
};

const MOCK_VEHICLES = [
  { plate: "ABC1D23", brand: "Volkswagen", model: "Gol 1.6 MSI", color: "Prata", year: 2022, fuel_type: "flex", category: "Passeio", passenger_capacity: 5, status: "Ativo", current_conductor: { full_name: "Ricardo Almeida", cpf: "***.456.789-**", cnh_number: "01234567891", cnh_category: "B" } },
  { plate: "BRA2E19", brand: "Fiat", model: "Strada Freedom CD", color: "Branco", year: 2023, fuel_type: "flex", category: "Utilitário", passenger_capacity: 3, status: "Ativo", current_conductor: { full_name: "Mariana Costa", cpf: "***.123.456-**", cnh_number: "98765432100", cnh_category: "B" } },
  { plate: "MER0C99", brand: "Mercedes-Benz", model: "Sprinter 416", color: "Branco", year: 2021, fuel_type: "diesel", category: "Van Escolar", passenger_capacity: 16, status: "Ativo", current_conductor: { full_name: "João Pereira", cpf: "***.789.012-**", cnh_number: "11223344556", cnh_category: "D" } },
  { plate: "SPO4L22", brand: "Toyota", model: "Corolla XEi", color: "Preto", year: 2024, fuel_type: "flex", category: "Passeio", passenger_capacity: 5, status: "Ativo", current_conductor: null },
  { plate: "VLM2024", brand: "Chevrolet", model: "Onix Plus", color: "Vermelho", year: 2023, fuel_type: "flex", category: "Passeio", passenger_capacity: 5, status: "Ativo", current_conductor: { full_name: "Ana Luiza Martins", cpf: "***.321.654-**", cnh_number: "55667788990", cnh_category: "B" } },
];

const STATS = [
  { label: "Veículos cadastrados", value: 48217, suffix: "", icon: "IconCar" },
  { label: "Motoristas ativos", value: 12980, suffix: "", icon: "IconUsers" },
  { label: "Denúncias resolvidas", value: 98, suffix: "%", icon: "IconShield" },
  { label: "Tempo médio resposta", value: 24, suffix: "h", icon: "IconClock" },
];

const SERVICES = [
  {
    id: "motorista",
    title: "Cadastro de Motorista",
    description: "Regularize condutores com CNH, foto, endereço e vínculo veicular. Aprovação em até 72h.",
    steps: ["Preencha dados pessoais", "Anexe CNH e comprovantes", "Receba protocolo digital"],
    icon: "IconUser",
    accent: "violet",
  },
  {
    id: "veiculo",
    title: "Cadastro de Veículo",
    description: "Registre o veículo com placa, documentação, fotos e vincule a motoristas da frota.",
    steps: ["Informe placa, chassi e RENAVAM", "Envie fotos do veículo", "Acompanhe análise"],
    icon: "IconCar",
    accent: "cyan",
  },
  {
    id: "denuncia",
    title: "Registrar Denúncia",
    description: "Reporte irregularidades com anonimato garantido. Sua denúncia é analisada pela fiscalização.",
    steps: ["Identifique o veículo", "Descreva a ocorrência", "Anexe fotos (opcional)"],
    icon: "IconFlag",
    accent: "amber",
  },
  {
    id: "consulta",
    title: "Consultar Protocolo",
    description: "Acompanhe o status da sua denúncia ou cadastro com o número de protocolo recebido.",
    steps: ["Informe o protocolo", "Visualize andamento", "Receba atualizações"],
    icon: "IconSearch",
    accent: "lime",
  },
];

const HOW_STEPS = [
  { n: "01", title: "Consulte a placa", body: "Digite a placa na busca do topo — respondemos em menos de 800ms." },
  { n: "02", title: "Visualize o veículo", body: "Ficha completa: fotos, motorista vinculado, documentação e histórico." },
  { n: "03", title: "Aja na plataforma", body: "Cadastre, denuncie ou acompanhe — tudo sem sair da página." },
];

const FAQ = [
  {
    q: "Quem pode usar a plataforma?",
    a: "Qualquer cidadão pode consultar placas, denunciar irregularidades e acompanhar protocolos. Gestores e operadores têm acesso autenticado para gerenciar a frota."
  },
  {
    q: "Minha denúncia é anônima?",
    a: "Sim. A identificação é opcional. Se preferir, você pode informar contato apenas para ser notificado sobre o andamento — esses dados não são compartilhados com o denunciado."
  },
  {
    q: "Quanto tempo leva a aprovação de um cadastro?",
    a: "Cadastros de motorista e veículo são analisados em até 72h úteis. Você recebe um protocolo imediato e é notificado por e-mail/WhatsApp quando o status mudar."
  },
  {
    q: "Os dados estão protegidos?",
    a: "Trabalhamos sob a LGPD. Documentos são criptografados em repouso e em trânsito; apenas analistas autorizados acessam informações sensíveis, com trilha de auditoria completa."
  },
  {
    q: "É possível integrar com meu sistema de gestão?",
    a: "Sim. Oferecemos API REST pública para consulta de veículos e webhooks para atualizações. Solicite acesso no formulário de contato."
  },
];

const PARTNERS = [
  "SECRETARIA DE TRANSPORTES", "FROTA URBANA", "DETRAN·PARCEIRO", "SINDICATO DOS MOTORISTAS",
  "LOGÍSTICA VIVA", "MOBILIZA SP", "CIDADÃO ATIVO", "ROTA SEGURA", "INSPEÇÃO VEICULAR"
];

const simulateApi = async (fn, delay = 650) =>
  new Promise((resolve) => setTimeout(() => resolve(fn()), delay));

const searchPlates = (query) => {
  const q = (query || "").toUpperCase().trim();
  if (!q) return [];
  return MOCK_VEHICLES.filter((v) => v.plate.includes(q)).slice(0, 6);
};

const fetchVehicleByPlate = (plate) => {
  const v = MOCK_VEHICLES.find((x) => x.plate === plate.toUpperCase().trim());
  return v || null;
};

Object.assign(window, {
  MOCK_CONFIG, MOCK_VEHICLES, STATS, SERVICES, HOW_STEPS, FAQ, PARTNERS,
  simulateApi, searchPlates, fetchVehicleByPlate,
});
