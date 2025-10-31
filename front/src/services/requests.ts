import { buildApiUrl } from "@/lib/api-client"

// Types
export interface DriverRequest {
  id: number;
  name: string;
  cpf: string;
  birth_date?: string;
  gender?: string;
  gender_display?: string;
  nationality?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  reference_point?: string;
  address?: string;
  email: string;
  phone: string;
  whatsapp?: string;
  license_number: string;
  license_category: string;
  license_category_display?: string;
  license_expiry_date?: string;
  document?: string;
  cnh_digital?: string;
  photo?: string;
  message?: string;
  status: 'em_analise' | 'aprovado' | 'reprovado';
  status_display?: string;
  created_at: string;
  viewed_at?: string;
  reviewed_at?: string;
  reviewed_by?: {
    id: number;
    username: string;
    email: string;
  };
  rejection_reason?: string;
  conductor?: {
    id: number;
    name: string;
  };
}

export interface VehicleRequest {
  id: number;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  chassis_number?: string;
  renavam?: string;
  fuel_type: string;
  category?: string;
  passenger_capacity?: number;
  crlv_pdf?: string;
  insurance_pdf?: string;
  photo_1?: string;
  photo_2?: string;
  photo_3?: string;
  photo_4?: string;
  photo_5?: string;
  message?: string;
  status: 'em_analise' | 'aprovado' | 'reprovado';
  created_at: string;
  viewed_at?: string;
  reviewed_at?: string;
  reviewed_by?: {
    id: number;
    username: string;
    email: string;
  };
  rejection_reason?: string;
  vehicle?: {
    id: number;
    plate: string;
  };
}

export interface RequestFilters {
  status?: string;
  search?: string;
}

// API Functions with authentication
async function fetchWithAuth(pathOrUrl: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  const url = pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
    ? pathOrUrl
    : buildApiUrl(pathOrUrl);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired - redirect to login
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  return response;
}

// Driver Requests
export async function getDriverRequests(filters?: RequestFilters): Promise<DriverRequest[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const url = `api/requests/drivers/${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) throw new Error('Erro ao buscar solicitações de motoristas');

  const data = await response.json();

  // Garantir que sempre retorne um array
  // Se a API retornar {results: [...]} use data.results
  // Se retornar um array direto, use data
  // Se for qualquer outra coisa, retorne array vazio
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.results)) {
    return data.results;
  } else if (data && data.success && Array.isArray(data.data)) {
    return data.data;
  } else {
    console.error('Unexpected API response format for driver requests:', data);
    return [];
  }
}

export async function getDriverRequestById(id: number): Promise<DriverRequest> {
  const response = await fetchWithAuth(`api/requests/drivers/${id}/`);

  if (!response.ok) throw new Error('Erro ao buscar detalhes da solicitação');

  return response.json();
}

export async function approveDriverRequest(id: number): Promise<void> {
  const response = await fetchWithAuth(`api/requests/drivers/${id}/approve/`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao aprovar solicitação');
  }
}

export async function rejectDriverRequest(id: number, reason: string): Promise<void> {
  const response = await fetchWithAuth(`api/requests/drivers/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ rejection_reason: reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao reprovar solicitação');
  }
}

export async function markDriverRequestAsViewed(id: number): Promise<void> {
  const response = await fetchWithAuth(`api/requests/drivers/${id}/mark_as_viewed/`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao marcar solicitação como visualizada');
  }
}

// Vehicle Requests
export async function getVehicleRequests(filters?: RequestFilters): Promise<VehicleRequest[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);

  const url = `api/requests/vehicles/${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) throw new Error('Erro ao buscar solicitações de veículos');

  const data = await response.json();

  // Garantir que sempre retorne um array
  // Se a API retornar {results: [...]} use data.results
  // Se retornar um array direto, use data
  // Se for qualquer outra coisa, retorne array vazio
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.results)) {
    return data.results;
  } else if (data && data.success && Array.isArray(data.data)) {
    return data.data;
  } else {
    console.error('Unexpected API response format for vehicle requests:', data);
    return [];
  }
}

export async function getVehicleRequestById(id: number): Promise<VehicleRequest> {
  const response = await fetchWithAuth(`api/requests/vehicles/${id}/`);

  if (!response.ok) throw new Error('Erro ao buscar detalhes da solicitação');

  return response.json();
}

export async function approveVehicleRequest(id: number): Promise<void> {
  const response = await fetchWithAuth(`api/requests/vehicles/${id}/approve/`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao aprovar solicitação');
  }
}

export async function rejectVehicleRequest(id: number, reason: string): Promise<void> {
  const response = await fetchWithAuth(`api/requests/vehicles/${id}/reject/`, {
    method: 'POST',
    body: JSON.stringify({ rejection_reason: reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao reprovar solicitação');
  }
}

export async function markVehicleRequestAsViewed(id: number): Promise<void> {
  const response = await fetchWithAuth(`api/requests/vehicles/${id}/mark_as_viewed/`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao marcar solicitação como visualizada');
  }
}
