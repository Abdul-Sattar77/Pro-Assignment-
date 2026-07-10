"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsPassword() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (newPass !== confirm) return;
    setSaved(true);
    setCurrent("");
    setNewPass("");
    setConfirm("");
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="size-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Make sure your password is strong and secure.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current">Current password</Label>
          <Input
            id="current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new">New password</Label>
          <Input
            id="new"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {newPass && confirm && newPass !== confirm && (
            <p className="text-destructive text-sm">Passwords do not match.</p>
          )}
        </div>
        <Button
          onClick={handleSave}
          disabled={!current || !newPass || newPass !== confirm}
        >
          {saved ? "Updated!" : "Update password"}
        </Button>
      </CardContent>
    </Card>
  );
}
