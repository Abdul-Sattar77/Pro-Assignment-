"use client";

import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNotificationSettings } from "../hooks/use-settings";

export function SettingsNotifications() {
  const { settings, toggle } = useNotificationSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose what notifications you receive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-medium">Email notifications</p>
          {[
            {
              key: "email_new_assignment" as const,
              label: "New assignment created",
            },
            {
              key: "email_new_message" as const,
              label: "New message received",
            },
            {
              key: "email_payment_received" as const,
              label: "Payment received",
            },
            {
              key: "email_deadline_reminder" as const,
              label: "Deadline reminders",
            },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label
                htmlFor={key}
                className="text-muted-foreground cursor-pointer text-sm"
              >
                {label}
              </Label>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => toggle(key)}
              />
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-sm font-medium">In-app notifications</p>
          {[
            {
              key: "inapp_new_assignment" as const,
              label: "New assignment created",
            },
            {
              key: "inapp_new_message" as const,
              label: "New message received",
            },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label
                htmlFor={key}
                className="text-muted-foreground cursor-pointer text-sm"
              >
                {label}
              </Label>
              <Switch
                id={key}
                checked={settings[key]}
                onCheckedChange={() => toggle(key)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
