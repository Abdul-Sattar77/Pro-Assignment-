import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { env } from "@/config/env";

/**
 * Lazily-created Laravel Echo client for Reverb (real-time chat). Returns null
 * when Reverb isn't configured or on the server — callers fall back to polling.
 * Auth uses the Bearer token against the Sanctum-protected broadcasting route.
 */

type EchoClient = Echo<"reverb">;

let client: EchoClient | null = null;

/**
 * Tear down the Echo client and its socket. Call on logout so a subsequent
 * login rebuilds the client with the NEW bearer token (the token is captured
 * at construction). Without this, the singleton keeps the previous session's
 * token and broadcasting auth fails / a stale socket lingers across accounts.
 */
export function disconnectEcho(): void {
  if (client) {
    client.disconnect();
    client = null;
  }
}

export function getEcho(): EchoClient | null {
  if (typeof window === "undefined") return null;
  if (client) return client;

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  if (!key) return null;

  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;

  client = new Echo<"reverb">({
    broadcaster: "reverb",
    key,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${env.apiUrl}/api/v1/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
        Accept: "application/json",
      },
    },
  });

  return client;
}
