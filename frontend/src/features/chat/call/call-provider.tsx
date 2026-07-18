"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api-client";
import { getEcho } from "@/lib/echo";
import { useCurrentUser } from "@/features/auth";
import { CallUI } from "./call-ui";

export type CallMedia = "audio" | "video";
export type CallState = "idle" | "outgoing" | "incoming" | "connected";

interface CallSignalEvent {
  type: "offer" | "answer" | "ice" | "hangup" | "reject";
  conversationId: string;
  from?: { id: string; name: string };
  media?: CallMedia;
  payload?: unknown;
}

interface CallContextValue {
  startCall: (
    conversationId: string,
    peerName: string,
    media: CallMedia,
  ) => void;
  busy: boolean;
}

const CallContext = createContext<CallContextValue | null>(null);

export function useCall(): CallContextValue | null {
  return useContext(CallContext);
}

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
  // Production reliability across strict NATs needs a TURN server, e.g.:
  // { urls: "turn:your-turn-host:3478", username: "...", credential: "..." }
};

/**
 * Global WebRTC 1:1 calling. Signaling (offer/answer/ICE/hangup) rides the
 * user's private `calls.{uuid}` Reverb channel. Mount once, high in the tree.
 */
export function CallProvider({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();
  const [state, setState] = useState<CallState>("idle");
  const [peerName, setPeerName] = useState("");
  const [media, setMedia] = useState<CallMedia>("video");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const convIdRef = useRef<string | null>(null);
  const incomingRef = useRef<{
    conversationId: string;
    media: CallMedia;
    offer: RTCSessionDescriptionInit;
  } | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  const sendSignal = useCallback(
    (
      conversationId: string,
      type: string,
      payload?: unknown,
      mk?: CallMedia,
    ) => {
      void apiClient
        .post(`/chat/conversations/${conversationId}/signal`, {
          type,
          payload,
          media: mk,
        })
        .catch(() => {});
    },
    [],
  );

  const cleanup = useCallback(() => {
    pcRef.current?.getSenders().forEach((s) => s.track?.stop());
    pcRef.current?.close();
    pcRef.current = null;
    setLocalStream((s) => {
      s?.getTracks().forEach((t) => t.stop());
      return null;
    });
    setRemoteStream(null);
    pendingIceRef.current = [];
    incomingRef.current = null;
    convIdRef.current = null;
    setMuted(false);
    setCameraOff(false);
    setState("idle");
  }, []);

  const createPc = useCallback(
    (conversationId: string, stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_CONFIG);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      pc.onicecandidate = (e) => {
        if (e.candidate)
          sendSignal(conversationId, "ice", e.candidate.toJSON());
      };
      pc.ontrack = (e) => setRemoteStream(e.streams[0] ?? null);
      pcRef.current = pc;
      return pc;
    },
    [sendSignal],
  );

  const getMedia = useCallback(async (kind: CallMedia) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: kind === "video",
    });
    setLocalStream(stream);
    return stream;
  }, []);

  const startCall = useCallback(
    async (conversationId: string, name: string, kind: CallMedia) => {
      if (pcRef.current || incomingRef.current) return;
      convIdRef.current = conversationId;
      setPeerName(name);
      setMedia(kind);
      setState("outgoing");
      try {
        const stream = await getMedia(kind);
        const pc = createPc(conversationId, stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignal(conversationId, "offer", offer, kind);
      } catch {
        cleanup();
      }
    },
    [getMedia, createPc, sendSignal, cleanup],
  );

  const acceptCall = useCallback(async () => {
    const inc = incomingRef.current;
    if (!inc) return;
    convIdRef.current = inc.conversationId;
    setState("connected");
    try {
      const stream = await getMedia(inc.media);
      const pc = createPc(inc.conversationId, stream);
      await pc.setRemoteDescription(inc.offer);
      for (const c of pendingIceRef.current) {
        await pc.addIceCandidate(c).catch(() => {});
      }
      pendingIceRef.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal(inc.conversationId, "answer", answer);
      incomingRef.current = null;
    } catch {
      cleanup();
    }
  }, [getMedia, createPc, sendSignal, cleanup]);

  const rejectCall = useCallback(() => {
    const inc = incomingRef.current;
    if (inc) sendSignal(inc.conversationId, "reject");
    cleanup();
  }, [sendSignal, cleanup]);

  const hangup = useCallback(() => {
    if (convIdRef.current) sendSignal(convIdRef.current, "hangup");
    cleanup();
  }, [sendSignal, cleanup]);

  const toggleMute = useCallback(() => {
    const track = localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMuted(!track.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    const track = localStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOff(!track.enabled);
    }
  }, [localStream]);

  // Subscribe to incoming call signals on the user's personal channel.
  useEffect(() => {
    if (!user) return;
    const echo = getEcho();
    if (!echo) return;
    const channel = `calls.${user.id}`;

    echo.private(channel).listen(".call.signal", (e: CallSignalEvent) => {
      if (e.type === "offer") {
        if (pcRef.current || incomingRef.current) {
          sendSignal(e.conversationId, "reject");
          return;
        }
        incomingRef.current = {
          conversationId: e.conversationId,
          media: e.media ?? "video",
          offer: e.payload as RTCSessionDescriptionInit,
        };
        setPeerName(e.from?.name ?? "Someone");
        setMedia(e.media ?? "video");
        setState("incoming");
      } else if (e.type === "answer") {
        void pcRef.current
          ?.setRemoteDescription(e.payload as RTCSessionDescriptionInit)
          .then(() => setState("connected"))
          .catch(() => {});
      } else if (e.type === "ice") {
        const cand = e.payload as RTCIceCandidateInit;
        if (pcRef.current?.remoteDescription) {
          void pcRef.current.addIceCandidate(cand).catch(() => {});
        } else {
          pendingIceRef.current.push(cand);
        }
      } else if (e.type === "hangup" || e.type === "reject") {
        cleanup();
      }
    });

    return () => {
      echo.leave(channel);
    };
  }, [user, sendSignal, cleanup]);

  return (
    <CallContext.Provider
      value={{
        startCall: (c, n, m) => void startCall(c, n, m),
        busy: state !== "idle",
      }}
    >
      {children}
      {state !== "idle" && (
        <CallUI
          state={state}
          peerName={peerName}
          media={media}
          localStream={localStream}
          remoteStream={remoteStream}
          muted={muted}
          cameraOff={cameraOff}
          onAccept={() => void acceptCall()}
          onReject={rejectCall}
          onHangup={hangup}
          onToggleMute={toggleMute}
          onToggleCamera={toggleCamera}
        />
      )}
    </CallContext.Provider>
  );
}
