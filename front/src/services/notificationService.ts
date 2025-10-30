import { buildApiUrl } from "@/lib/api-client";
import {
  Notification,
  NotificationCountResponse,
  MarkAllAsReadResponse,
} from "@/types/notification";

async function fetchWithAuth(pathOrUrl: string, options: RequestInit = {}) {
  const token = localStorage.getItem("access_token");
  const url =
    pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? pathOrUrl
      : buildApiUrl(pathOrUrl);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    window.location.href = "/login";
    throw new Error("Sessão expirada");
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
