import { useState } from "react";
import type { NotificationSettings } from "../types";

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    email_new_assignment: true,
    email_new_message: true,
    email_payment_received: true,
    email_deadline_reminder: true,
    inapp_new_assignment: true,
    inapp_new_message: true,
  });

  function toggle(key: keyof NotificationSettings) {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return { settings, toggle };
}
