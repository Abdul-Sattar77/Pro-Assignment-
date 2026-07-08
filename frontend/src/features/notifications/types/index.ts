/** In-app notification (mirrors backend NotificationResource). */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  assignmentId: string | null;
  read: boolean;
  createdAt: string | null;
}
