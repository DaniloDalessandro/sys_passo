import { buildApiUrl } from "@/lib/api-client"

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
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  return response;
}

export interface Complaint {
  id: number;
  vehicle_plate: string;
  complaint_type: string;
  complaint_type_display: string;
  description: string;
  occurrence_date?: string;
  occurrence_location?: string;
  complainant_name?: string;
  complainant_email?: string;
  complainant_phone?: string;
  is_anonymous: boolean;
  status: 'pendente' | 'em_analise' | 'resolvida' | 'arquivada';
  status_display: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  priority_display: string;
  created_at: string;
  updated_at: string;
  reviewed_by?: {
    id: number;
    username: string;
    email: string;
  };
  reviewed_at?: string;
  admin_notes?: string;
  resolution_notes?: string;
  vehicle?: {
    id: number;
    plate: string;
    brand: string;
    model: string;
  };
}

export interface ComplaintFilters {
  status?: string;
  priority?: string;
  search?: string;
}

export async function getComplaints(filters?: ComplaintFilters): Promise<Complaint[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.search) params.append('search', filters.search);

  const url = `api/complaints/${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetchWithAuth(url);

  if (!response.ok) throw new Error('Erro ao buscar denúncias');

  const data = await response.json();

  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.results)) {
    return data.results;
  } else {
    console.error('Unexpected API response format:', data);
    return [];
  }
}

export async function updateComplaintStatus(id: number, status: string): Promise<void> {
  const response = await fetchWithAuth(`api/complaints/${id}/change_status/`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar status');
  }
}

export async function updateComplaintPriority(id: number, priority: string): Promise<void> {
  const response = await fetchWithAuth(`api/complaints/${id}/change_priority/`, {
    method: 'POST',
    body: JSON.stringify({ priority }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar prioridade');
  }
}

export async function updateComplaint(id: number, data: {
  admin_notes?: string;
  resolution_notes?: string;
}): Promise<void> {
  const response = await fetchWithAuth(`api/complaints/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erro ao atualizar denúncia');
  }
}
