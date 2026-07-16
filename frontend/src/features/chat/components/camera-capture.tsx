"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CircleStop, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Camera capture overlay — live preview with "take photo" and "record video".
 * Produces a File and hands it back via onCapture. Tracks are stopped on close.
 */
export function CameraCapture({
  onCapture,
  onClose,
}: {
  onCapture: (file: File) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" }, audio: true })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      })
      .catch(() => setError("Couldn't access the camera. Check permissions."));

    return () => {
      cancelled = true;
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const takePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(
          new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" }),
        );
        onClose();
      },
      "image/jpeg",
      0.9,
    );
  };

  const toggleRecord = () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    const stream = streamRef.current;
    if (!stream) return;
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      onCapture(
        new File([blob], `video-${Date.now()}.webm`, { type: "video/webm" }),
      );
      onClose();
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between p-3">
        <span className="text-sm font-medium text-white">Camera</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close camera"
          className="text-white/80 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        {error ? (
          <p className="px-6 text-center text-sm text-white/80">{error}</p>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className="max-h-full max-w-full"
          />
        )}
        {recording && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white">
            <span className="size-2 animate-pulse rounded-full bg-white" />
            REC
          </span>
        )}
      </div>

      {!error && (
        <div className="flex items-center justify-center gap-4 p-5">
          <Button
            type="button"
            size="lg"
            onClick={takePhoto}
            disabled={recording}
          >
            <Camera className="size-5" />
            Photo
          </Button>
          <Button
            type="button"
            size="lg"
            variant={recording ? "destructive" : "secondary"}
            onClick={toggleRecord}
          >
            {recording ? (
              <>
                <CircleStop className="size-5" />
                Stop
              </>
            ) : (
              <>
                <Video className="size-5" />
                Record
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
