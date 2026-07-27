/**
 * WhatsApp surface palette.
 *
 * The WhatsApp inbox deliberately departs from the portal's navy/blue design
 * system: sales staff switch between this screen and real WhatsApp all day, and
 * a familiar surface is the point. The design system's rule that matters here
 * is "no raw hex scattered through feature code" — so every WhatsApp colour
 * lives in this one file and components consume named classes.
 *
 * Values mirror WhatsApp Web's own light/dark themes.
 */

export const WA = {
  /** Left conversation-list panel. */
  panel: "bg-white dark:bg-[#111b21]",
  /** Top bars on both panels. */
  header: "bg-[#f0f2f5] dark:bg-[#202c33]",
  /** Hairline dividers. */
  border: "border-[#e9edef] dark:border-[#2a3942]",
  /** Chat area behind the bubbles (pattern is applied separately). */
  chat: "bg-[#efeae2] dark:bg-[#0b141a]",

  /** Outgoing bubble — WhatsApp's pale green / deep teal. */
  outgoing: "bg-[#d9fdd3] dark:bg-[#005c4b]",
  /** Incoming bubble. */
  incoming: "bg-white dark:bg-[#202c33]",

  /** Primary text. */
  text: "text-[#111b21] dark:text-[#e9edef]",
  /** Secondary/meta text (timestamps, previews). */
  muted: "text-[#667781] dark:text-[#8696a0]",
  /** Timestamp inside a bubble — dimmer still. */
  bubbleMeta: "text-[#667781] dark:text-[#8696a0]/80",

  /** WhatsApp brand green — send button, unread badge, active accents. */
  accent: "bg-[#00a884] hover:bg-[#017561]",
  accentText: "text-[#00a884]",
  /** Read receipt blue. */
  tickRead: "text-[#53bdeb]",

  /** Row hover + selected states in the conversation list. */
  rowHover: "hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]",
  rowActive: "bg-[#f0f2f5] dark:bg-[#2a3942]",

  /** Composer input pill. */
  input: "bg-white dark:bg-[#2a3942]",

  /** Date separator / system pill floating over the chat. */
  pill: "bg-[#ffffff] dark:bg-[#182229] text-[#54656f] dark:text-[#8696a0]",
} as const;

/**
 * WhatsApp's doodle wallpaper, as an inline SVG data URI so nothing external
 * is fetched. Light and dark differ only in stroke opacity; the tile repeats.
 */
const DOODLE = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="260" viewBox="0 0 260 260">
    <g fill="none" stroke="#000" stroke-width="1.4" stroke-linecap="round">
      <path d="M22 34c6-8 16-8 22 0s16 8 22 0"/>
      <circle cx="196" cy="40" r="11"/>
      <path d="M188 40h16M196 32v16"/>
      <path d="M60 96h26l-6 10h-14z"/>
      <path d="M128 78c8 0 14 6 14 13s-6 13-14 13h-4l-8 7v-7c-6-2-10-7-10-13 0-7 6-13 14-13z"/>
      <path d="M214 118c5-6 13-6 18 0"/>
      <circle cx="36" cy="150" r="9"/>
      <path d="M96 168l10-18 10 18z"/>
      <path d="M150 158h30v20h-30z"/>
      <path d="M150 158l15 12 15-12"/>
      <path d="M216 196c6-8 16-8 22 0"/>
      <circle cx="72" cy="222" r="10"/>
      <path d="M66 222h12M72 216v12"/>
      <path d="M120 214c7 0 12 5 12 11s-5 11-12 11h-3l-7 6v-6c-5-2-9-6-9-11 0-6 5-11 11-11z"/>
      <path d="M14 84c5-6 13-6 18 0"/>
      <path d="M172 96l8-14 8 14z"/>
    </g>
  </svg>`,
);

/** Inline style applying the tiled doodle. Opacity is theme-tuned via CSS. */
export const doodleStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,${DOODLE}")`,
  backgroundRepeat: "repeat",
  backgroundSize: "260px 260px",
};
