"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Loader2,
  Mic,
  Paperclip,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSendMessage } from "../hooks/use-chat";
import { CameraCapture } from "./camera-capture";
import { VoicePlayer } from "./voice-player";

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isVoiceFile(file: File): boolean {
  return file.type.startsWith("audio/") || file.name.startsWith("voice-");
}

/** Message composer: text + file attach + voice note + camera photo/video. */
export function Composer({ conversationId }: { conversationId: string }) {
  const send = useSendMessage(conversationId);
  const [text, setText] = useState("");
  const [pending, setPending] = useState<File | null>(null);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const cancelledRef = useRef(false);

  const canSend =
    (text.trim().length > 0 || pending !== null) && !send.isPending;

  // Object URL for previewing a recorded/attached voice note before sending.
  useEffect(() => {
    if (!pending) {
      setPendingUrl(null);
      return;
    }
    const url = URL.createObjectURL(pending);
    setPendingUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pending]);

  // Recording timer.
  useEffect(() => {
    if (!recording) return;
    setSeconds(0);
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const submit = () => {
    if (!canSend) return;
    setError(null);
    send.mutate(
      { body: text.trim() || undefined, file: pending ?? undefined },
      {
        onSuccess: () => {
          setText("");
          setPending(null);
        },
        onError: (e) =>
          setError(
            e instanceof Error && e.message
              ? e.message
              : "Couldn't send — check your connection and try again.",
          ),
      },
    );
  };

  const startVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      cancelledRef.current = false;
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        if (cancelledRef.current) {
          cancelledRef.current = false;
          chunksRef.current = [];
          return;
        }
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setPending(
          new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" }),
        );
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      /* mic denied */
    }
  };

  const stopVoice = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const cancelVoice = () => {
    cancelledRef.current = true;
    recorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div className="relative border-t p-3">
      {cameraOpen && (
        <CameraCapture
          onCapture={(file) => setPending(file)}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {/* Pending attachment preview */}
      {pending &&
        (isVoiceFile(pending) && pendingUrl ? (
          <div className="bg-muted/50 mb-2 flex items-center gap-2 rounded-2xl px-3 py-2">
            <VoicePlayer src={pendingUrl} />
            <button
              type="button"
              onClick={() => setPending(null)}
              aria-label="Discard voice note"
              className="text-muted-foreground hover:text-destructive ml-auto"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <div className="bg-muted/50 mb-2 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs">
            <Paperclip className="size-3.5" />
            <span className="max-w-48 flex-1 truncate">{pending.name}</span>
            <button
              type="button"
              onClick={() => setPending(null)}
              aria-label="Remove attachment"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

      {error && (
        <p className="text-destructive mb-2 text-xs" role="alert">
          {error}
        </p>
      )}

      {recording ? (
        /* ── Recording bar (WhatsApp-style) ── */
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive shrink-0"
            aria-label="Cancel recording"
            onClick={cancelVoice}
          >
            <Trash2 className="size-4.5" />
          </Button>
          <div className="bg-muted/50 flex flex-1 items-center gap-3 rounded-full px-4 py-2">
            <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-red-500" />
            <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
              {fmtTime(seconds)}
            </span>
            <div className="flex h-6 flex-1 items-center gap-0.75 overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => (
                <span
                  key={i}
                  className="w-0.75 shrink-0 animate-pulse rounded-full bg-red-400/60"
                  style={{
                    height: `${6 + ((i * 7) % 15)}px`,
                    animationDelay: `${(i * 45) % 900}ms`,
                  }}
                />
              ))}
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            className="shrink-0"
            aria-label="Stop and attach"
            onClick={stopVoice}
          >
            <Check className="size-4" />
          </Button>
        </div>
      ) : (
        /* ── Normal input row ── */
        <div className="flex items-end gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setPending(e.target.files[0]);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Attach file"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="size-4.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Camera"
            onClick={() => setCameraOpen(true)}
          >
            <Camera className="size-4.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label="Record voice note"
            onClick={startVoice}
          >
            <Mic className="size-4.5" />
          </Button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="Type a message…"
            className="border-input focus-visible:ring-ring/50 max-h-28 min-h-9 flex-1 resize-none rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2"
          />

          <Button
            type="button"
            size="icon"
            className="shrink-0"
            aria-label="Send"
            disabled={!canSend}
            onClick={submit}
          >
            {send.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
