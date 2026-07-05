"use client";

const ITEMS = [
  "Essays",
  "Research papers",
  "Dissertations",
  "Case studies",
  "Presentations",
  "Business plans",
  "Editing",
  "Statistics",
  "Literature reviews",
  "Technical reports",
];

/**
 * Infinite editorial ticker separating the hero from the body. Two copies of
 * the row scroll seamlessly; animation pauses for reduced-motion users (CSS).
 */
export function Marquee() {
  const row = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-8 pr-8"
    >
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-8 whitespace-nowrap">
          <span className="font-serif text-2xl italic sm:text-3xl">{item}</span>
          <span className="text-primary text-xl" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="overflow-hidden border-y py-6">
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
