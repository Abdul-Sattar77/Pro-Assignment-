/**
 * Gmail surface palette.
 *
 * Same reasoning as the WhatsApp inbox: staff move between this screen and
 * real Gmail all day, so familiarity beats house style here. The design
 * system's rule that still applies is "no raw hex scattered through feature
 * code" — every colour lives in this file and components consume named
 * classes.
 *
 * Values mirror Gmail's own light/dark themes.
 */

export const GM = {
  /** Page + list background. */
  surface: "bg-white dark:bg-[#1f1f1f]",
  /** Reading pane / raised card. */
  raised: "bg-white dark:bg-[#282a2c]",
  /** Toolbars. */
  toolbar: "bg-[#f6f8fc] dark:bg-[#1f1f1f]",
  /** Hairline dividers. */
  border: "border-[#e0e0e0] dark:border-[#444746]",

  /** Primary text. */
  text: "text-[#202124] dark:text-[#e3e3e3]",
  /** Secondary text — snippets, dates, meta. */
  muted: "text-[#5f6368] dark:text-[#9aa0a6]",

  /** Gmail blue — links, active states, primary action. */
  accent: "bg-[#0b57d0] hover:bg-[#0842a0]",
  accentText: "text-[#0b57d0] dark:text-[#a8c7fa]",

  /** A read row sits on a faint tint; unread rows stay white and go bold. */
  rowRead: "bg-[#f2f6fc] dark:bg-[#1f1f1f]",
  rowUnread: "bg-white dark:bg-[#2d2e30]",
  rowHover:
    "hover:shadow-[inset_0_-1px_0_0_rgba(100,121,143,0.2),0_1px_2px_0_rgba(60,64,67,0.3)]",
  rowActive: "bg-[#c2e7ff] dark:bg-[#004a77]",

  /** Chips (labels, assignment, status). */
  chip: "bg-[#e8eaed] dark:bg-[#3c4043] text-[#3c4043] dark:text-[#e3e3e3]",
} as const;

/** Deterministic avatar tint from an address, as Gmail does. */
const AVATAR_TINTS = [
  "bg-[#d93025]",
  "bg-[#e37400]",
  "bg-[#188038]",
  "bg-[#1a73e8]",
  "bg-[#a142f4]",
  "bg-[#12b5cb]",
  "bg-[#c5221f]",
  "bg-[#f9ab00]",
] as const;

export function avatarTint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}
