export interface Notification {
  id: number;
  notification_type: "driver_request" | "vehicle_request";
  notification_type_display: string;
  request_id: number;
  title: string;
  message: string;
  is_read: boolean;
  read_by: number | null;
  read_by_username: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationCountResponse {
  unread_count: number;
}

export interface MarkAllAsReadResponse {
  message: string;
  updated_count: number;
}
