"use client";

import { useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types/notification";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error: any) {
      // Silencia erros de rede para não bloquear a UI
      console.warn("Erro ao buscar contador de notificações:", error.message);
      // Define contador como 0 em caso de erro
      setUnreadCount(0);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const data = await notificationService.getUnread();
      setNotifications(data);
    } catch (error: any) {
      // Silencia erros de rede para não bloquear a UI
      console.warn("Erro ao buscar notificações:", error.message);
      // Define array vazio em caso de erro
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Atualiza o contador a cada 30 segundos
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchUnreadNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      await fetchUnreadCount();
      await fetchUnreadNotifications();
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      await fetchUnreadCount();
      await fetchUnreadNotifications();
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marca como lida
    await handleMarkAsRead(notification.id);

    // Redireciona para a página apropriada
    if (notification.notification_type === "driver_request") {
      router.push(`/admin/requests/drivers/${notification.request_id}`);
    } else if (notification.notification_type === "vehicle_request") {
      router.push(`/admin/requests/vehicles/${notification.request_id}`);
    }

    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Agora há pouco";
    } else if (diffInHours < 24) {
      return `Há ${diffInHours}h`;
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificações</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={handleMarkAllAsRead}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma notificação nova
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3 cursor-pointer hover:bg-accent"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex justify-between w-full items-start">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500 ml-2 mt-1 flex-shrink-0" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-2">
                  {formatDate(notification.created_at)}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
