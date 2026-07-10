import type { Notification } from "../types/index";

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "assignment_new",
    title: "New assignment received",
    message: "Assignment #A-104 has been created and needs a writer.",
    isRead: false,
    createdAt: new Date().toISOString(),
    href: "/dashboard/assignments",
  },
  {
    id: "2",
    type: "message_new",
    title: "New message",
    message: "Client sent a message on Assignment #A-101.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    href: "/dashboard/assignments",
  },
  {
    id: "3",
    type: "payment_received",
    title: "Payment received",
    message: "PKR 5,000 payment confirmed for Assignment #A-099.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    href: "/dashboard/assignments",
  },
  {
    id: "4",
    type: "deadline_reminder",
    title: "Deadline tomorrow",
    message: "Assignment #A-102 is due tomorrow at 11:59 PM.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    href: "/dashboard/assignments",
  },
];
