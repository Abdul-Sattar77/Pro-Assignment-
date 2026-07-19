import { ImageResponse } from "next/og";
import { SITE } from "@/config/seo";

export const alt = SITE.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded social-share card, generated at request time. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background:
          "linear-gradient(135deg, #070b1a 0%, #0f1830 55%, #1a1740 100%)",
        color: "#eaf0ff",
        fontFamily: "sans-serif",
      }}
    >
      {/* Glow accents */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 460,
          height: 460,
          borderRadius: 460,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.45), transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -160,
          left: -100,
          width: 460,
          height: 460,
          borderRadius: 460,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          P
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: -0.5 }}>
          Prossignment
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          marginTop: 40,
          fontSize: 78,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: -2,
          maxWidth: 940,
        }}
      >
        <span>Academic Excellence,&nbsp;</span>
        <span
          style={{
            background: "linear-gradient(90deg, #60a5fa, #a78bfa)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Delivered On Time.
        </span>
      </div>

      <div
        style={{ marginTop: 32, fontSize: 30, color: "#93a0bd", maxWidth: 820 }}
      >
        Expert academic writing, research, dissertations & programming — matched
        to a subject specialist.
      </div>
    </div>,
    { ...size },
  );
}
