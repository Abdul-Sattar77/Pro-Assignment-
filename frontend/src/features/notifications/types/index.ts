export type NotificationType =
  | "assignment_new"
  | "assignment_status"
  | "message_new"
  | "payment_received"
  | "deadline_reminder"
  | "revision_requested";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  href?: string;
}
