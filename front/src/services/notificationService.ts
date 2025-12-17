import { buildApiUrl } from "@/lib/api-client";
import {
  Notification,
  NotificationCountResponse,
  MarkAllAsReadResponse,
} from "@/types/notification";

/**
 * Helper para fazer requisições autenticadas
 * Adiciona o token de autenticação aos headers
 */
async function fetchWithAuth(pathOrUrl: string, options: RequestInit = {}) {
  const url =
    pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? pathOrUrl
      : buildApiUrl(pathOrUrl);

  // Obtém o token do localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

  // Prepara os headers com o token
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // Adiciona o token de autenticação se existir
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Faz a requisição
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se receber 401, token expirou ou é inválido
  if (response.status === 401) {
    // Redireciona para login
    if (typeof window !== 'undefined') {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }

  return response;
}

/**
 * Serviço para gerenciar notificações de solicitações.
 */
export const notificationService = {
  /**
   * Lista todas as notificações
   */
  async getAll(): Promise<Notification[]> {
    const response = await fetchWithAuth("/api/notifications/");
    if (!response.ok) {
      throw new Error("Erro ao buscar notificações");
    }
    return response.json();
  },

  /**
   * Lista apenas notificações não lidas
   */
  async getUnread(): Promise<Notification[]> {
    const response = await fetchWithAuth("/api/notifications/unread/");
    if (!response.ok) {
      throw new Error("Erro ao buscar notificações não lidas");
    }
    return response.json();
  },

  /**
   * Obtém o contador de notificações não lidas
   */
  async getUnreadCount(): Promise<number> {
    const response = await fetchWithAuth("/api/notifications/unread_count/");
    if (!response.ok) {
      throw new Error("Erro ao buscar contador de notificações");
    }
    const data: NotificationCountResponse = await response.json();
    return data.unread_count;
  },

  /**
   * Marca uma notificação como lida
   */
  async markAsRead(id: number): Promise<Notification> {
    const response = await fetchWithAuth(`/api/notifications/${id}/mark_as_read/`, {
      method: "PATCH",
    });
    if (!response.ok) {
      throw new Error("Erro ao marcar notificação como lida");
    }
    return response.json();
  },

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(): Promise<MarkAllAsReadResponse> {
    const response = await fetchWithAuth("/api/notifications/mark_all_as_read/", {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error("Erro ao marcar todas as notificações como lidas");
    }
    return response.json();
  },
};
