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
 * Ghost ticker between hero and body — oversized outlined display type
 * drifting horizontally. Pauses for reduced-motion users (CSS).
 */
export function Marquee() {
  const row = (ariaHidden: boolean) => (
    <div
      aria-hidden={ariaHidden}
      className="flex shrink-0 items-center gap-10 pr-10"
    >
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center gap-10 whitespace-nowrap">
          <span className="font-display text-4xl font-bold tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(148,148,220,0.35)] sm:text-5xl">
            {item}
          </span>
          <span className="aurora-text text-2xl" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="overflow-hidden py-10">
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
