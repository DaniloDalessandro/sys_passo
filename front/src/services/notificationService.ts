import { buildApiUrl } from "@/lib/api-client";
import {
  Notification,
  NotificationCountResponse,
  MarkAllAsReadResponse,
} from "@/types/notification";

async function fetchWithAuth(pathOrUrl: string, options: RequestInit = {}) {
  const url =
    pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? pathOrUrl
      : buildApiUrl(pathOrUrl);

  const token = typeof window !== 'undefined' ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return response;
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const response = await fetchWithAuth("/api/notifications/");
    if (!response.ok) {
      throw new Error("Erro ao buscar notificações");
    }
    return response.json();
  },

  async getUnread(): Promise<Notification[]> {
    const response = await fetchWithAuth("/api/notifications/unread/");
    if (!response.ok) {
      throw new Error("Erro ao buscar notificações não lidas");
    }
    return response.json();
  },

  async getUnreadCount(): Promise<number> {
    const response = await fetchWithAuth("/api/notifications/unread_count/");
    if (!response.ok) {
      throw new Error("Erro ao buscar contador de notificações");
    }
    const data: NotificationCountResponse = await response.json();
    return data.unread_count;
  },

  async markAsRead(id: number): Promise<Notification> {
    const response = await fetchWithAuth(`/api/notifications/${id}/mark_as_read/`, {
      method: "PATCH",
    });
    if (!response.ok) {
      throw new Error("Erro ao marcar notificação como lida");
    }
    return response.json();
  },

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
