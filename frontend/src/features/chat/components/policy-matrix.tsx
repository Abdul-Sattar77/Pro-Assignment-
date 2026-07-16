"use client";

import { Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatPolicies, useUpdateChatPolicies } from "../hooks/use-chat";
import type { ChatPolicy, ChatRole } from "../types";
import { roleLabel } from "./conversation-list";

function Toggle({
  on,
  disabled,
  onClick,
}: {
  on: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-primary" : "bg-muted-foreground/30",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
      )}
    >
      <span
        className={cn(
          "inline-block size-5 rounded-full bg-white shadow transition-transform",
          on ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

/** Admin permission matrix: toggle which role pairs may message each other. */
export function PolicyMatrix() {
  const { data: policies, isPending } = useChatPolicies();
  const update = useUpdateChatPolicies();

  const toggle = (policy: ChatPolicy) => {
    if (policy.locked) return;
    update.mutate([
      {
        role_a: policy.roleA,
        role_b: policy.roleB,
        allowed: !policy.allowed,
      },
    ]);
  };

  if (isPending) {
    return (
      <div className="text-muted-foreground flex justify-center py-12">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border">
      {policies?.map((policy) => (
        <div
          key={`${policy.roleA}-${policy.roleB}`}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {roleLabel(policy.roleA as ChatRole)}
            </span>
            <span className="text-muted-foreground">↔</span>
            <span className="font-medium">
              {roleLabel(policy.roleB as ChatRole)}
            </span>
            {policy.locked && (
              <span className="text-muted-foreground ml-1 inline-flex items-center gap-1 text-xs">
                <Lock className="size-3" /> always on
              </span>
            )}
          </div>
          <Toggle
            on={policy.allowed}
            disabled={policy.locked || update.isPending}
            onClick={() => toggle(policy)}
          />
        </div>
      ))}
      <p className="text-muted-foreground px-4 py-3 text-xs">
        Enabled pairs can start conversations with each other. Admin pairs are
        always on. Changes apply immediately.
      </p>
    </div>
  );
}
