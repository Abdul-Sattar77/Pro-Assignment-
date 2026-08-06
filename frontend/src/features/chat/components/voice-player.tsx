"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/** A fixed pseudo-waveform (bar heights 0..1) — WhatsApp-style, no analysis. */
const BARS = [
  0.3, 0.55, 0.4, 0.75, 0.5, 0.7, 0.35, 0.9, 0.55, 0.42, 0.68, 0.5, 0.8, 0.45,
  0.62, 0.32, 0.72, 0.5, 0.85, 0.4, 0.6, 0.46, 0.7, 0.55, 0.36, 0.66, 0.5, 0.82,
  0.44, 0.6,
];

function fmt(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Compact voice-note player (play/pause + progress waveform + time), styled to
 * sit inside a chat bubble. `mine` flips the colours for the sender's bubble.
 */
export function VoicePlayer({
  src,
  mine = false,
}: {
  src: string;
  mine?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else void el.play();
  };

  const seekTo = (fraction: number) => {
    const el = audioRef.current;
    if (!el || !isFinite(duration) || duration <= 0) return;
    el.currentTime = Math.min(Math.max(fraction, 0), 1) * duration;
  };

  const progress = duration > 0 ? current / duration : 0;

  return (
    <div className="flex min-w-[210px] items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-95",
          mine ? "bg-white/20 text-white" : "bg-primary/15 text-primary",
        )}
      >
        {playing ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4 translate-x-px" />
        )}
      </button>

      {/* Waveform (click to seek) */}
      <div
        className="flex h-8 flex-1 cursor-pointer items-center gap-0.75"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          seekTo((e.clientX - rect.left) / rect.width);
        }}
      >
        {BARS.map((h, i) => {
          const active = i / BARS.length <= progress;
          return (
            <span
              key={i}
              style={{ height: `${5 + h * 18}px` }}
              className={cn(
                "w-0.75 rounded-full transition-colors",
                active
                  ? mine
                    ? "bg-white"
                    : "bg-primary"
                  : mine
                    ? "bg-white/35"
                    : "bg-muted-foreground/30",
              )}
            />
          );
        })}
      </div>

      <span
        className={cn(
          "shrink-0 text-[11px] tabular-nums",
          mine ? "text-white/80" : "text-muted-foreground",
        )}
      >
        {fmt(playing || current > 0 ? current : duration)}
      </span>

      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
      />
    </div>
  );
}
