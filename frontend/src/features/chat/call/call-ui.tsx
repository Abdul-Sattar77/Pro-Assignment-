"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CallMedia, CallState } from "./call-provider";

/** Attaches a MediaStream to a <video> element. */
function useStreamVideo(stream: MediaStream | null) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return ref;
}

export function CallUI({
  state,
  peerName,
  media,
  localStream,
  remoteStream,
  muted,
  cameraOff,
  onAccept,
  onReject,
  onHangup,
  onToggleMute,
  onToggleCamera,
}: {
  state: CallState;
  peerName: string;
  media: CallMedia;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  muted: boolean;
  cameraOff: boolean;
  onAccept: () => void;
  onReject: () => void;
  onHangup: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
}) {
  const localRef = useStreamVideo(localStream);
  const remoteRef = useStreamVideo(remoteStream);
  const isVideo = media === "video";

  // Incoming ring — compact modal.
  if (state === "incoming") {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
        <div className="bg-card w-full max-w-xs rounded-2xl border p-6 text-center shadow-2xl">
          <span className="bg-primary/15 text-primary mx-auto flex size-16 items-center justify-center rounded-full">
            {isVideo ? (
              <Video className="size-7" />
            ) : (
              <Phone className="size-7" />
            )}
          </span>
          <p className="mt-4 text-lg font-semibold">{peerName}</p>
          <p className="text-muted-foreground text-sm">
            Incoming {isVideo ? "video" : "voice"} call…
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              type="button"
              onClick={onReject}
              aria-label="Decline"
              className="flex size-14 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-105"
            >
              <PhoneOff className="size-6" />
            </button>
            <button
              type="button"
              onClick={onAccept}
              aria-label="Accept"
              className="flex size-14 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-105"
            >
              <Phone className="size-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outgoing / connected — full call surface.
  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-[#070b1a]">
      {/* Remote video / avatar */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {remoteStream && isVideo ? (
          <video
            ref={remoteRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-white">
            <span className="flex size-24 items-center justify-center rounded-full bg-white/10 text-3xl font-bold">
              {peerName.slice(0, 1).toUpperCase()}
            </span>
            <p className="text-xl font-semibold">{peerName}</p>
            <p className="text-sm text-white/60">
              {state === "outgoing" ? "Calling…" : "Connected"}
            </p>
          </div>
        )}
        {/* Hidden audio sink when audio-only */}
        {remoteStream && !isVideo && (
          <video ref={remoteRef} autoPlay playsInline className="hidden" />
        )}

        {/* Local PiP */}
        {isVideo && localStream && (
          <video
            ref={localRef}
            autoPlay
            playsInline
            muted
            className="absolute right-4 bottom-4 h-40 w-28 rounded-xl border border-white/20 object-cover shadow-lg"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 py-8">
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className={cn(
            "flex size-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105",
            muted ? "bg-white/25" : "bg-white/10",
          )}
        >
          {muted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
        </button>
        {isVideo && (
          <button
            type="button"
            onClick={onToggleCamera}
            aria-label={cameraOff ? "Camera on" : "Camera off"}
            className={cn(
              "flex size-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105",
              cameraOff ? "bg-white/25" : "bg-white/10",
            )}
          >
            {cameraOff ? (
              <VideoOff className="size-6" />
            ) : (
              <Video className="size-6" />
            )}
          </button>
        )}
        <button
          type="button"
          onClick={onHangup}
          aria-label="Hang up"
          className="flex size-16 items-center justify-center rounded-full bg-red-500 text-white transition-transform hover:scale-105"
        >
          <PhoneOff className="size-7" />
        </button>
      </div>
    </div>
  );
}
