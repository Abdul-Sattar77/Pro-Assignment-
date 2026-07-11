"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSend: (content: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  }

  return (
    <div className="bg-background border-t p-4">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button size="icon" onClick={handleSend} disabled={!value.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
      <p className="text-muted-foreground mt-1.5 px-1 text-[10px]">
        Press Enter to send
      </p>
    </div>
  );
}
